/**
 * Camada de acesso a editais.
 * Usa Supabase quando configurado, senão cai no mock local.
 */

import {
  MOCK_EDITAIS,
  calcularScore,
  type Edital,
  type UserPreferences,
} from "./mock-data";
import { createClient } from "./supabase";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Busca todos os editais com prazo ainda aberto. */
export async function fetchEditais(): Promise<Edital[]> {
  if (!SUPABASE_CONFIGURED) {
    return MOCK_EDITAIS.filter((e) => new Date(e.prazo_inscricao) >= new Date());
  }

  const supabase = createClient();
  const hoje = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("editais")
    .select("*")
    .gte("prazo_inscricao", hoje)
    .order("prazo_inscricao", { ascending: true })
    .limit(200);

  if (error) {
    console.error("fetchEditais error:", error.message);
    return MOCK_EDITAIS;
  }

  return (data ?? []) as Edital[];
}

/** Busca editais filtrados por preferências do usuário. */
export async function fetchEditaisComScore(prefs: UserPreferences): Promise<Edital[]> {
  const editais = await fetchEditais();
  return editais
    .map((e) => ({ ...e, score: calcularScore(e, prefs) }))
    .filter((e) => (e.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/** Salva preferências do usuário no Supabase (se configurado). */
export async function saveUserPreferences(
  userId: string,
  prefs: UserPreferences
): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;

  const supabase = createClient();
  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      grandes_areas: prefs.grandes_areas,
      micro_areas: prefs.micro_areas,
      estados: prefs.estados,
      niveis: prefs.niveis,
      aceita_ead: prefs.aceita_ead,
      onesignal_id: userId, // external_id = user_id do Supabase
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) console.error("saveUserPreferences error:", error.message);
}

/** Invoca a Edge Function run-matching para cold start. */
export async function triggerColdStart(userId: string): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return;

  try {
    await fetch(`${supabaseUrl}/functions/v1/run-matching`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });
  } catch {
    // não é crítico — matching roda no cron diário também
  }
}
