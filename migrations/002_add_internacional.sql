-- ============================================================
-- PosGrad Tracker — Migração 002: campos internacionais
-- Rodar em: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE editais ADD COLUMN IF NOT EXISTS internacional BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE editais ADD COLUMN IF NOT EXISTS pais_destino TEXT;
ALTER TABLE editais ADD COLUMN IF NOT EXISTS universidade TEXT;

CREATE INDEX IF NOT EXISTS idx_editais_internacional ON editais (internacional) WHERE internacional = TRUE;
