/**
 * Edge Function: send-notifications
 *
 * Busca matches pendentes (score >= 40, não notificados, ≤3 pushes/dia)
 * e envia push via OneSignal REST API.
 * Registra cada envio em notification_log e marca notified=true no match.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";
const BASE_URL = Deno.env.get("NEXT_PUBLIC_BASE_URL") ?? "https://posgrad-tracker.vercel.app";

interface PendingNotification {
  user_id: string;
  edital_id: string;
  score: number;
  match_id: string;
  onesignal_id: string;
  programa_nome: string;
  ies_sigla: string | null;
  estado: string | null;
  nivel: string | null;
  prazo_inscricao: string | null;
  link_edital: string | null;
}

function formatPrazo(prazo: string | null): string {
  if (!prazo) return "em breve";
  const d = new Date(prazo + "T12:00:00");
  return d.toLocaleDateString("pt-BR");
}

async function sendPush(
  onesignalAppId: string,
  onesignalApiKey: string,
  externalId: string,
  heading: string,
  content: string,
  url: string,
): Promise<{ id?: string; error?: string }> {
  const body = {
    app_id: onesignalAppId,
    filters: [{ field: "external_id", value: externalId }],
    headings: { pt: heading, en: heading },
    contents: { pt: content, en: content },
    url,
  };

  const res = await fetch(ONESIGNAL_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${onesignalApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (res.ok && json.id) return { id: json.id };
  return { error: JSON.stringify(json) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const onesignalAppId = Deno.env.get("ONESIGNAL_APP_ID") ?? "";
  const onesignalApiKey = Deno.env.get("ONESIGNAL_API_KEY") ?? "";

  if (!onesignalAppId || !onesignalApiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "ONESIGNAL_APP_ID/API_KEY não configurados" }),
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: pending, error } = await supabase.rpc("get_pending_notifications", {
      p_limit: 50,
    });

    if (error) throw error;

    const rows = (pending ?? []) as PendingNotification[];
    let sent = 0;
    let failed = 0;

    for (const row of rows) {
      const heading = `🎓 ${row.programa_nome.slice(0, 60)}`;
      const parts = [row.ies_sigla, row.estado, row.prazo_inscricao ? `até ${formatPrazo(row.prazo_inscricao)}` : null]
        .filter(Boolean);
      const content = parts.join(" · ");
      const url = `${BASE_URL}/editais/${row.edital_id}`;

      const result = await sendPush(
        onesignalAppId,
        onesignalApiKey,
        row.onesignal_id,
        heading,
        content,
        url,
      );

      // Registra no log
      await supabase.from("notification_log").insert({
        user_id: row.user_id,
        edital_id: row.edital_id,
        channel: "push",
        template: "match_novo",
        status: result.id ? "sent" : "failed",
        onesignal_id: result.id ?? null,
        error_msg: result.error ?? null,
      });

      if (result.id) {
        // Marca match como notificado
        await supabase
          .from("user_matches")
          .update({ notified: true, notified_at: new Date().toISOString() })
          .eq("id", row.match_id);
        sent++;
      } else {
        console.error(`Push falhou para match ${row.match_id}:`, result.error);
        failed++;
      }
    }

    console.log(`send-notifications OK — ${sent} enviados, ${failed} falhas`);

    return new Response(
      JSON.stringify({ ok: true, sent, failed, total: rows.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("send-notifications ERRO:", msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
