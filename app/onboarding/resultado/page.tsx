"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { fetchEditaisComScore } from "@/lib/editais";
import {
  calcularDiasRestantes,
  NIVEL_LABELS,
  GRANDE_AREA_LABELS,
  type Edital,
  type UserPreferences,
  type GrandeArea,
  type Nivel,
  type UF,
} from "@/lib/mock-data";

export default function ResultadoPage() {
  const router = useRouter();
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const areas = JSON.parse(sessionStorage.getItem("posgrad_areas") || "[]") as GrandeArea[];
    const micro_areas = JSON.parse(sessionStorage.getItem("posgrad_micro_areas") || "[]") as string[];
    const estados = JSON.parse(sessionStorage.getItem("posgrad_estados") || "[]") as UF[];
    const niveis = JSON.parse(sessionStorage.getItem("posgrad_niveis") || "[]") as Nivel[];
    const aceita_ead = JSON.parse(sessionStorage.getItem("posgrad_ead") || "false") as boolean;
    const aceita_internacional = JSON.parse(sessionStorage.getItem("posgrad_internacional") || "false") as boolean;

    const prefs: UserPreferences = { grandes_areas: areas, micro_areas, estados, niveis, aceita_ead, aceita_internacional };

    fetchEditaisComScore(prefs).then((resultados) => {
      setEditais(resultados);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🔍</div>
          <p className="text-gray-600 font-medium">Buscando editais para você...</p>
          <p className="text-gray-400 text-sm mt-1">Analisando mais de 7.000 programas</p>
        </div>
      </main>
    );
  }

  if (editais.length === 0) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Você está na fila!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Não encontramos editais abertos agora para seu perfil, mas você será o primeiro a saber quando abrir!
          </p>
          <Button
            onClick={() => router.push("/onboarding/notificacoes")}
            className="w-full bg-blue-900 hover:bg-blue-900 text-white"
          >
            Ativar notificações
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Aha moment */}
        <div className="bg-blue-900 rounded-2xl p-6 text-white text-center mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <h1 className="text-2xl font-bold">
            {editais.length} editais abertos para você!
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Baseado no seu perfil
          </p>
        </div>

        {/* Lista de resultados (top 3) */}
        <div className="space-y-3 mb-6">
          {editais.slice(0, 3).map((edital) => {
            const dias = calcularDiasRestantes(edital.prazo_inscricao);
            return (
              <div
                key={edital.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">
                      {edital.programa_nome}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {edital.ies_sigla} · {edital.estado} · {edital.cidade}
                    </p>
                  </div>
                  <Badge
                    className={`shrink-0 text-xs ${
                      dias <= 7
                        ? "bg-red-100 text-red-700"
                        : dias <= 30
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {dias}d
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {NIVEL_LABELS[edital.nivel]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {GRANDE_AREA_LABELS[edital.grande_area]}
                  </Badge>
                  {edital.bolsas_disponiveis && (
                    <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">
                      💰 Bolsa
                    </Badge>
                  )}
                </div>
                {edital.score !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full">
                        <div
                          className="h-1 bg-blue-500 rounded-full"
                          style={{ width: `${edital.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{edital.score}% match</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {editais.length > 3 && (
          <p className="text-center text-sm text-gray-500 mb-6">
            + {editais.length - 3} editais no seu dashboard
          </p>
        )}

        <Button
          onClick={() => router.push("/onboarding/notificacoes")}
          className="w-full bg-blue-900 hover:bg-blue-900 text-white h-12 text-base"
        >
          Ativar notificações 🔔
        </Button>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }), "w-full mt-2 text-gray-500")}>
          Ver todos os editais
        </Link>
      </div>
    </main>
  );
}
