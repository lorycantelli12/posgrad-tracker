"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GRANDES_AREAS, type GrandeArea } from "@/lib/mock-data";
import { OnboardingProgress } from "@/components/posgrad/onboarding-progress";

export default function AreasPage() {
  const router = useRouter();
  const [selecionadas, setSelecionadas] = useState<GrandeArea[]>([]);

  function toggleArea(area: GrandeArea) {
    setSelecionadas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function handleContinuar() {
    // Salva no sessionStorage para usar nas próximas telas
    sessionStorage.setItem("posgrad_areas", JSON.stringify(selecionadas));
    router.push("/onboarding/micro-areas");
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <OnboardingProgress step={1} total={5} />

        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Qual sua área de interesse?
          </h1>
          <p className="text-gray-500 mt-1">
            Selecione uma ou mais. Você pode alterar depois.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {GRANDES_AREAS.map((area) => {
            const isSelected = selecionadas.includes(area.value);
            return (
              <button
                key={area.value}
                onClick={() => toggleArea(area.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-blue-900 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{area.emoji}</span>
                <span
                  className={`font-medium text-sm ${
                    isSelected ? "text-blue-900" : "text-gray-700"
                  }`}
                >
                  {area.label}
                </span>
                {isSelected && (
                  <span className="ml-auto text-blue-900">✓</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={handleContinuar}
            disabled={selecionadas.length === 0}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white h-12"
          >
            Continuar
            {selecionadas.length > 0 && (
              <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {selecionadas.length}
              </span>
            )}
          </Button>
          <p className="text-center text-xs text-gray-400">
            Selecione pelo menos 1 área para continuar
          </p>
        </div>
      </div>
    </main>
  );
}
