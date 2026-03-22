"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "@/components/posgrad/onboarding-progress";
import { requestPushPermission } from "@/components/posgrad/onesignal-provider";
import { saveUserPreferences, triggerColdStart } from "@/lib/editais";
import { track } from "@/components/posgrad/posthog-provider";
import { createClient } from "@/lib/supabase";
import type { GrandeArea, Nivel, UF } from "@/lib/mock-data";

// Fallback para testes sem Supabase Auth
const TEST_EXTERNAL_ID = "posgrad_test_user_001";

export default function NotificacoesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  async function handleAtivar() {
    setStatus("requesting");

    // Tenta obter usuário autenticado do Supabase; usa TEST_EXTERNAL_ID se não autenticado
    let userId = TEST_EXTERNAL_ID;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) userId = user.id;
    } catch { /* não autenticado ainda */ }

    // Salva preferências no Supabase (se configurado)
    try {
      const prefs = {
        grandes_areas: JSON.parse(sessionStorage.getItem("posgrad_areas") || "[]") as GrandeArea[],
        micro_areas: JSON.parse(sessionStorage.getItem("posgrad_micro_areas") || "[]") as string[],
        estados: JSON.parse(sessionStorage.getItem("posgrad_estados") || "[]") as UF[],
        niveis: JSON.parse(sessionStorage.getItem("posgrad_niveis") || "[]") as Nivel[],
        aceita_ead: JSON.parse(sessionStorage.getItem("posgrad_ead") || "false") as boolean,
        paises: JSON.parse(sessionStorage.getItem("posgrad_paises") || "[]") as string[],
        quer_brasil: JSON.parse(sessionStorage.getItem("posgrad_quer_brasil") || "true") as boolean,
      };
      await saveUserPreferences(userId, prefs);
    } catch { /* não crítico */ }

    // Solicita permissão de push
    await requestPushPermission(userId);

    // Cold start: calcula matches imediatamente
    triggerColdStart(userId).catch(() => { /* background */ });

    track("onboarding_complete", { notifications: true });
    setStatus("granted");
    await new Promise((r) => setTimeout(r, 800));
    router.push("/dashboard");
  }

  function handlePular() {
    track("onboarding_complete", { notifications: false });
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <OnboardingProgress step={5} total={5} />

        <div className="mt-10 text-center">
          {status === "granted" ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900">Notificações ativas!</h1>
              <p className="text-gray-500 mt-2">Redirecionando para o dashboard...</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🔔</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Nunca perca um edital
              </h1>
              <p className="text-gray-500 text-sm mb-8">
                Ative as notificações para receber alertas em tempo real quando um
                novo edital abrir para o seu perfil.
              </p>

              {/* Prévia da notificação */}
              <div className="bg-gray-100 rounded-2xl p-4 mb-8 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white text-lg shrink-0">
                    🎓
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      PosGrad Tracker
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      🎓 Mestrado em Ciência da Computação — USP · SP · até 30/04
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAtivar}
                  disabled={status === "requesting"}
                  className="w-full bg-blue-900 hover:bg-blue-950 text-white h-12"
                >
                  {status === "requesting" ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Ativando...
                    </span>
                  ) : (
                    "Ativar notificações"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handlePular}
                  className="w-full text-gray-400"
                >
                  Agora não
                </Button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Máximo 3 notificações por dia. Sem spam.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
