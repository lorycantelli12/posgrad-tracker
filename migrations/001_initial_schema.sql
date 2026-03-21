-- ============================================================
-- PosGrad Tracker — Schema inicial
-- Rodar em: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Editais ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS editais (
  id                  TEXT        PRIMARY KEY,
  programa_nome       TEXT        NOT NULL,
  ies_nome            TEXT        NOT NULL,
  ies_sigla           TEXT,
  grande_area         TEXT,
  area_especifica     TEXT,
  nivel               TEXT,        -- 'mestrado' | 'mestrado_profissional' | 'doutorado'
  estado              TEXT,        -- UF (SP, RJ, …) ou NULL para nacional
  cidade              TEXT,
  modalidade          TEXT        NOT NULL DEFAULT 'presencial',
  vagas               INTEGER     NOT NULL DEFAULT 0,
  prazo_inscricao     DATE,
  data_inicio_aulas   DATE,
  link_edital         TEXT,
  bolsas_disponiveis  BOOLEAN     NOT NULL DEFAULT FALSE,
  fonte               TEXT,        -- 'capes' | 'dou' | 'ies'
  descricao           TEXT,
  raw_json            JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_editais_grande_area    ON editais (grande_area);
CREATE INDEX IF NOT EXISTS idx_editais_estado         ON editais (estado);
CREATE INDEX IF NOT EXISTS idx_editais_nivel          ON editais (nivel);
CREATE INDEX IF NOT EXISTS idx_editais_prazo          ON editais (prazo_inscricao);
CREATE INDEX IF NOT EXISTS idx_editais_fonte          ON editais (fonte);

-- ── Preferências do usuário ────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grandes_areas TEXT[]      NOT NULL DEFAULT '{}',
  micro_areas   TEXT[]      NOT NULL DEFAULT '{}',
  estados       TEXT[]      NOT NULL DEFAULT '{}',
  niveis        TEXT[]      NOT NULL DEFAULT '{}',
  aceita_ead    BOOLEAN     NOT NULL DEFAULT FALSE,
  onesignal_id  TEXT,        -- external_id do OneSignal (= user_id por ora)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_preferences UNIQUE (user_id)
);

-- ── Matches computados ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_matches (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edital_id   TEXT        NOT NULL REFERENCES editais(id)   ON DELETE CASCADE,
  score       INTEGER     NOT NULL DEFAULT 0,
  notified    BOOLEAN     NOT NULL DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_match UNIQUE (user_id, edital_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user_id   ON user_matches (user_id);
CREATE INDEX IF NOT EXISTS idx_matches_notified  ON user_matches (notified);
CREATE INDEX IF NOT EXISTS idx_matches_score     ON user_matches (score DESC);

-- ── Log de notificações ────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  edital_id    TEXT        REFERENCES editais(id)    ON DELETE SET NULL,
  channel      TEXT        NOT NULL,  -- 'push' | 'email'
  template     TEXT        NOT NULL,  -- 'match_novo' | 'deadline' | 'digest' | 'welcome' | 'first_match'
  status       TEXT        NOT NULL DEFAULT 'sent',  -- 'sent' | 'failed'
  onesignal_id TEXT,
  resend_id    TEXT,
  error_msg    TEXT,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_log_user    ON notification_log (user_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_sent_at ON notification_log (sent_at);

-- ── RLS — Row Level Security ───────────────────────────────
ALTER TABLE editais           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log  ENABLE ROW LEVEL SECURITY;

-- Editais: leitura pública (qualquer usuário autenticado ou anônimo)
CREATE POLICY "editais_select" ON editais
  FOR SELECT USING (TRUE);

-- Preferências: usuário só vê/edita as próprias
CREATE POLICY "prefs_select" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "prefs_insert" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prefs_update" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Matches: usuário só vê os próprios
CREATE POLICY "matches_select" ON user_matches
  FOR SELECT USING (auth.uid() = user_id);

-- Notification log: usuário só vê os próprios
CREATE POLICY "notif_log_select" ON notification_log
  FOR SELECT USING (auth.uid() = user_id);

-- ── Função SQL: matching em batch ─────────────────────────
-- Chamada pela Edge Function run-matching
-- Calcula score para (user_id, edital_id) e faz upsert em user_matches
CREATE OR REPLACE FUNCTION run_matching_job(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Se p_user_id fornecido: só esse usuário. Caso contrário: todos.
  INSERT INTO user_matches (user_id, edital_id, score)
  SELECT
    p.user_id,
    e.id AS edital_id,
    -- Área (40 pts)
    CASE
      WHEN array_length(p.grandes_areas, 1) IS NULL THEN 40
      WHEN e.grande_area = ANY(p.grandes_areas) THEN 40
      ELSE 0
    END
    -- Estado (30 pts)
    + CASE
      WHEN array_length(p.estados, 1) IS NULL THEN 30
      WHEN e.estado = ANY(p.estados) THEN 30
      WHEN e.estado IS NULL THEN 15   -- edital federal/nacional
      ELSE 0
    END
    -- Nível (20 pts)
    + CASE
      WHEN array_length(p.niveis, 1) IS NULL THEN 20
      WHEN e.nivel = ANY(p.niveis) THEN 20
      ELSE 0
    END
    -- Modalidade (10 pts — só EaD aceito)
    + CASE
      WHEN e.modalidade = 'ead' AND p.aceita_ead THEN 10
      ELSE 0
    END
    AS score
  FROM user_preferences p
  CROSS JOIN editais e
  WHERE
    -- Filtra só usuário específico se informado
    (p_user_id IS NULL OR p.user_id = p_user_id)
    -- Prazo ainda não expirou
    AND (e.prazo_inscricao IS NULL OR e.prazo_inscricao >= CURRENT_DATE)
    -- Score mínimo > 0
    AND (
      (array_length(p.grandes_areas, 1) IS NULL OR e.grande_area = ANY(p.grandes_areas))
      OR (array_length(p.estados, 1) IS NULL OR e.estado = ANY(p.estados) OR e.estado IS NULL)
      OR (array_length(p.niveis, 1) IS NULL OR e.nivel = ANY(p.niveis))
    )
  ON CONFLICT (user_id, edital_id) DO UPDATE
    SET score = EXCLUDED.score
  WHERE user_matches.score != EXCLUDED.score;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ── Função SQL: matches pendentes de notificação ───────────
CREATE OR REPLACE FUNCTION get_pending_notifications(p_limit INT DEFAULT 100)
RETURNS TABLE (
  user_id     UUID,
  edital_id   TEXT,
  score       INTEGER,
  match_id    UUID,
  onesignal_id TEXT,
  -- campos do edital
  programa_nome     TEXT,
  ies_sigla         TEXT,
  estado            TEXT,
  nivel             TEXT,
  prazo_inscricao   DATE,
  link_edital       TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    m.user_id,
    m.edital_id,
    m.score,
    m.id AS match_id,
    p.onesignal_id,
    e.programa_nome,
    e.ies_sigla,
    e.estado,
    e.nivel,
    e.prazo_inscricao,
    e.link_edital
  FROM user_matches m
  JOIN user_preferences p ON p.user_id = m.user_id
  JOIN editais e ON e.id = m.edital_id
  WHERE
    m.notified = FALSE
    AND m.score >= 40
    AND p.onesignal_id IS NOT NULL
    -- Limite anti-fadiga: max 3 pushes por usuário nas últimas 24h
    AND (
      SELECT COUNT(*) FROM notification_log nl
      WHERE nl.user_id = m.user_id
        AND nl.channel = 'push'
        AND nl.sent_at > NOW() - INTERVAL '24 hours'
    ) < 3
  ORDER BY m.score DESC
  LIMIT p_limit;
$$;

-- ── Trigger: updated_at automático ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE TRIGGER tg_editais_updated_at
  BEFORE UPDATE ON editais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER tg_user_prefs_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
