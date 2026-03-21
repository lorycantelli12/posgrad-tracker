/**
 * Edge Function: run-matching
 *
 * Invoca a função SQL run_matching_job() para calcular matches
 * entre usuários e editais.
 *
 * Pode ser chamada:
 *  - Pelo GitHub Actions após scraping
 *  - Pelo onboarding (cold start), passando { user_id }
 *  - Manualmente via Supabase Dashboard
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Opcional: user_id no body para cold start
    let userId: string | null = null;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      userId = body?.user_id ?? null;
    }

    const { data, error } = await supabase.rpc("run_matching_job", {
      p_user_id: userId,
    });

    if (error) throw error;

    const matchesUpdated = data as number;

    console.log(`run-matching OK — ${matchesUpdated} matches atualizados (user_id=${userId ?? "todos"})`);

    return new Response(
      JSON.stringify({ ok: true, matches_updated: matchesUpdated, user_id: userId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("run-matching ERRO:", msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
