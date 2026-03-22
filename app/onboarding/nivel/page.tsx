"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { type Nivel } from "@/lib/mock-data";
import { OnboardingProgress } from "@/components/posgrad/onboarding-progress";

const NIVEIS: { value: Nivel; label: string; desc: string; emoji: string }[] = [
  {
    value: "mestrado",
    label: "Mestrado Acadêmico",
    desc: "Foco em pesquisa científica, título de Mestre",
    emoji: "📖",
  },
  {
    value: "mestrado_profissional",
    label: "Mestrado Profissional",
    desc: "Aplicação prática, voltado ao mercado",
    emoji: "💼",
  },
  {
    value: "doutorado",
    label: "Doutorado",
    desc: "Alta profundidade científica, título de Doutor",
    emoji: "🏆",
  },
  {
    value: "pos_doutorado",
    label: "Pós-Doutorado",
    desc: "Pesquisa avançada após o doutorado",
    emoji: "🔬",
  },
];

export default function NivelPage() {
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<Nivel[]>([]);
  const [aceita_internacional, setAceitaInternacional] = useState<boolean>(false);

  function toggleNivel(nivel: Nivel) {
    setSelecionados((prev) =>
      prev.includes(nivel) ? prev.filter((n) => n !== nivel) : [...prev, nivel]
    );
  }

  function handleContinuar() {
    sessionStorage.setItem("posgrad_niveis", JSON.stringify(selecionados));
    sessionStorage.setItem("posgrad_internacional", JSON.stringify(aceita_internacional));
    router.push("/onboarding/resultado");
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <OnboardingProgress step={4} total={5} />

        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Qual nível você busca?
          </h1>
          <p className="text-gray-500 mt-1">
            Pode selecionar mais de um.
          </p>
        </div>

        <div className="space-y-3">
          {NIVEIS.map((nivel) => {
            const isSelected = selecionados.includes(nivel.value);
            return (
              <button
                key={nivel.value}
                onClick={() => toggleNivel(nivel.value)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-blue-900 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-3xl">{nivel.emoji}</span>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {nivel.label}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{nivel.desc}</p>
                </div>
                {isSelected && (
                  <span className="text-blue-900 mt-1">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Internacional */}
        <button
          onClick={() => setAceitaInternacional(!aceita_internacional)}
          className={`w-full mt-3 flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
            aceita_internacional
              ? "border-blue-900 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-3xl">🌍</span>
          <div className="flex-1">
            <p className={`font-semibold ${aceita_internacional ? "text-blue-900" : "text-gray-900"}`}>
              Bolsas Internacionais
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              CAPES, CNPq, Fulbright, DAAD, JSPS, Erasmus e mais
            </p>
          </div>
          {aceita_internacional && <span className="text-blue-900">✓</span>}
        </button>

        <div className="mt-8">
          <Button
            onClick={handleContinuar}
            disabled={selecionados.length === 0}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white h-12"
          >
            Ver meus resultados
          </Button>
          {selecionados.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Selecione pelo menos 1 nível
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
