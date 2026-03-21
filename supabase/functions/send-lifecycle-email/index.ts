/**
 * Edge Function: send-lifecycle-email
 *
 * Envia emails de ciclo de vida via Resend:
 *  - welcome       → imediatamente após criar conta
 *  - first_match   → quando o primeiro match é encontrado
 *  - digest        → resumo semanal (chamada por cron)
 *
 * Body esperado:
 *   { template: "welcome" | "first_match" | "digest", user_id: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_URL = "https://api.resend.com/emails";
const BASE_URL = Deno.env.get("NEXT_PUBLIC_BASE_URL") ?? "https://posgrad-tracker.vercel.app";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "PosGrad Tracker <noreply@posgrad.app>";

// ─── Templates ────────────────────────────────────────────────────────────────

function htmlWelcome(email: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:sans-serif;max-width:540px;margin:auto;padding:24px;color:#111">
  <h1 style="color:#4f46e5">Bem-vindo ao PosGrad Tracker! 🎓</h1>
  <p>Olá! Sua conta foi criada com sucesso.</p>
  <p>A partir de agora você receberá notificações sempre que um novo edital de pós-graduação abrir na sua área de interesse.</p>
  <a href="${BASE_URL}/dashboard"
     style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
    Ver dashboard →
  </a>
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="font-size:12px;color:#6b7280">Este email foi enviado para ${email}. PosGrad Tracker.</p>
</body>
</html>`;
}

function htmlFirstMatch(programa: string, ies: string, prazo: string, editalId: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:sans-serif;max-width:540px;margin:auto;padding:24px;color:#111">
  <h1 style="color:#4f46e5">Seu primeiro match chegou! 🎉</h1>
  <p>Encontramos um edital aberto perfeito para o seu perfil:</p>
  <div style="background:#f5f3ff;border-radius:12px;padding:16px;margin:16px 0">
    <strong>${programa}</strong><br>
    <span style="color:#6b7280">${ies} · Prazo: ${prazo}</span>
  </div>
  <a href="${BASE_URL}/editais/${editalId}"
     style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">
    Ver edital →
  </a>
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="font-size:12px;color:#6b7280">PosGrad Tracker</p>
</body>
</html>`;
}

function htmlDigest(matches: Array<{ programa_nome: string; ies_sigla: string; prazo_inscricao: string; id: string }>): string {
  const items = matches.slice(0, 5).map(m => {
    const prazo = new Date(m.prazo_inscricao + "T12:00:00").toLocaleDateString("pt-BR");
    return `<li style="margin-bottom:8px">
      <a href="${BASE_URL}/editais/${m.id}" style="color:#4f46e5">${m.programa_nome}</a>
      <span style="color:#6b7280"> — ${m.ies_sigla} · até ${prazo}</span>
    </li>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:sans-serif;max-width:540px;margin:auto;padding:24px;color:#111">
  <h1 style="color:#4f46e5">📋 ${matches.length} editais abertos esta semana</h1>
  <p>Aqui estão os editais mais relevantes para o seu perfil:</p>
  <ul style="padding-left:20px">${items}</ul>
  <a href="${BASE_URL}/dashboard"
     style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">
    Ver todos →
  </a>
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="font-size:12px;color:#6b7280">PosGrad Tracker</p>
</body>
</html>`;
}

// ─── Envio via Resend ─────────────────────────────────────────────────────────

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<{ id?: string; error?: string }> {
  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  const json = await res.json();
  if (res.ok && json.id) return { id: json.id };
  return { error: JSON.stringify(json) };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  if (!resendKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "RESEND_API_KEY não configurada" }),
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const { template, user_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Busca email do usuário
    const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(user_id);
    if (userErr || !user?.email) throw new Error("Usuário não encontrado");

    let subject = "";
    let html = "";

    if (template === "welcome") {
      subject = "Bem-vindo ao PosGrad Tracker! 🎓";
      html = htmlWelcome(user.email);
    } else if (template === "first_match") {
      const { data: matches } = await supabase
        .from("user_matches")
        .select("edital_id, score, editais(programa_nome, ies_sigla, prazo_inscricao)")
        .eq("user_id", user_id)
        .order("score", { ascending: false })
        .limit(1);

      if (!matches?.length) throw new Error("Nenhum match encontrado para first_match");
      const m = matches[0];
      const e = m.editais as { programa_nome: string; ies_sigla: string; prazo_inscricao: string };
      const prazo = new Date(e.prazo_inscricao + "T12:00:00").toLocaleDateString("pt-BR");
      subject = "Seu primeiro edital compatível chegou! 🎉";
      html = htmlFirstMatch(e.programa_nome, e.ies_sigla, prazo, m.edital_id);
    } else if (template === "digest") {
      const { data: matches } = await supabase
        .from("user_matches")
        .select("edital_id, score, editais(programa_nome, ies_sigla, prazo_inscricao, id)")
        .eq("user_id", user_id)
        .gte("score", 40)
        .order("score", { ascending: false })
        .limit(10);

      if (!matches?.length) throw new Error("Nenhum match para digest");
      const editais = matches.map((m) => ({ ...(m.editais as object), id: m.edital_id } as { programa_nome: string; ies_sigla: string; prazo_inscricao: string; id: string }));
      subject = `📋 ${editais.length} editais abertos na sua área esta semana`;
      html = htmlDigest(editais);
    } else {
      throw new Error(`Template desconhecido: ${template}`);
    }

    const result = await sendEmail(resendKey, user.email, subject, html);

    if (result.error) throw new Error(result.error);

    // Log
    await supabase.from("notification_log").insert({
      user_id,
      channel: "email",
      template,
      status: "sent",
      resend_id: result.id,
    });

    console.log(`send-lifecycle-email OK — template=${template} user=${user_id} resend_id=${result.id}`);

    return new Response(
      JSON.stringify({ ok: true, resend_id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("send-lifecycle-email ERRO:", msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
