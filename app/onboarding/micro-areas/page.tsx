"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MICRO_AREAS,
  GRANDES_AREAS,
  type GrandeArea,
  type MicroArea,
} from "@/lib/mock-data";
import { OnboardingProgress } from "@/components/posgrad/onboarding-progress";

function lerAreasDoStorage(): GrandeArea[] {
  try {
    const saved = sessionStorage.getItem("posgrad_areas");
    if (!saved) return [];
    return JSON.parse(saved) as GrandeArea[];
  } catch { return []; }
}

export default function MicroAreasPage() {
  const router = useRouter();
  const [grandesAreasSelecionadas] = useState<GrandeArea[]>(() => lerAreasDoStorage());
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<GrandeArea | null>(() => lerAreasDoStorage()[0] ?? null);

  useEffect(() => {
    if (grandesAreasSelecionadas.length === 0) {
      router.replace("/onboarding/areas");
    }
  }, [grandesAreasSelecionadas, router]);

  function toggleMicro(value: string) {
    setSelecionadas((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleContinuar() {
    sessionStorage.setItem("posgrad_micro_areas", JSON.stringify(selecionadas));
    router.push("/onboarding/estados");
  }

  function handlePular() {
    sessionStorage.setItem("posgrad_micro_areas", JSON.stringify([]));
    router.push("/onboarding/estados");
  }

  if (!abaAtiva) return null;

  const microsDaAba: MicroArea[] = MICRO_AREAS[abaAtiva] ?? [];
  const abaInfo = GRANDES_AREAS.find((a) => a.value === abaAtiva);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <OnboardingProgress step={2} total={5} />

        <div className="mt-8 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Quais áreas específicas?
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Opcional — refina ainda mais seus resultados.
          </p>
        </div>

        {/* Tabs por grande área */}
        {grandesAreasSelecionadas.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {grandesAreasSelecionadas.map((ga) => {
              const info = GRANDES_AREAS.find((a) => a.value === ga);
              const count = selecionadas.filter((s) =>
                MICRO_AREAS[ga]?.some((m) => m.value === s)
              ).length;
              return (
                <button
                  key={ga}
                  onClick={() => setAbaAtiva(ga)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    abaAtiva === ga
                      ? "bg-blue-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{info?.emoji}</span>
                  <span className="max-w-[90px] truncate">{info?.label.split(" ")[0]}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${abaAtiva === ga ? "bg-white/20" : "bg-blue-50 text-blue-900"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Header da aba */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{abaInfo?.emoji}</span>
          <span className="font-semibold text-gray-700 text-sm">{abaInfo?.label}</span>
        </div>

        {/* Grid de micro-áreas */}
        <div className="grid grid-cols-2 gap-2">
          {microsDaAba.map((micro) => {
            const isSelected = selecionadas.includes(micro.value);
            return (
              <button
                key={micro.value}
                onClick={() => toggleMicro(micro.value)}
                className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                  isSelected
                    ? "border-blue-900 bg-blue-50 text-blue-900"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span>{micro.label}</span>
                {isSelected && <span className="float-right text-blue-900">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Contador total */}
        {selecionadas.length > 0 && (
          <p className="text-xs text-blue-900 font-medium mt-3">
            {selecionadas.length} área{selecionadas.length > 1 ? "s" : ""} específica{selecionadas.length > 1 ? "s" : ""} selecionada{selecionadas.length > 1 ? "s" : ""}
          </p>
        )}

        <div className="mt-8 space-y-3">
          <Button
            onClick={handleContinuar}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white h-12"
          >
            {selecionadas.length > 0
              ? `Continuar com ${selecionadas.length} área${selecionadas.length > 1 ? "s" : ""}`
              : "Continuar"}
          </Button>
          <button
            onClick={handlePular}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
          >
            Pular — ver todas as áreas da grande área
          </button>
        </div>
      </div>
    </main>
  );
}
