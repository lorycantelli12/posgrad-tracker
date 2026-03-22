"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ESTADOS, type UF } from "@/lib/mock-data";
import { OnboardingProgress } from "@/components/posgrad/onboarding-progress";

const REGIOES: { label: string; estados: typeof ESTADOS }[] = [
  {
    label: "Norte",
    estados: ESTADOS.filter((e) =>
      ["AC", "AM", "AP", "PA", "RO", "RR", "TO"].includes(e.value)
    ),
  },
  {
    label: "Nordeste",
    estados: ESTADOS.filter((e) =>
      ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"].includes(e.value)
    ),
  },
  {
    label: "Centro-Oeste",
    estados: ESTADOS.filter((e) =>
      ["DF", "GO", "MS", "MT"].includes(e.value)
    ),
  },
  {
    label: "Sudeste",
    estados: ESTADOS.filter((e) =>
      ["ES", "MG", "RJ", "SP"].includes(e.value)
    ),
  },
  {
    label: "Sul",
    estados: ESTADOS.filter((e) => ["PR", "RS", "SC"].includes(e.value)),
  },
];

export default function EstadosPage() {
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<UF[]>([]);
  const [aceitaEad, setAceitaEad] = useState(false);
  const [aceitaInternacional, setAceitaInternacional] = useState(false);

  function toggleEstado(uf: UF) {
    setSelecionados((prev) =>
      prev.includes(uf) ? prev.filter((e) => e !== uf) : [...prev, uf]
    );
  }

  function handleContinuar() {
    sessionStorage.setItem("posgrad_estados", JSON.stringify(selecionados));
    sessionStorage.setItem("posgrad_ead", JSON.stringify(aceitaEad));
    sessionStorage.setItem("posgrad_internacional", JSON.stringify(aceitaInternacional));
    router.push("/onboarding/nivel");
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <OnboardingProgress step={3} total={5} />

        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Onde você quer estudar?
          </h1>
          <p className="text-gray-500 mt-1">
            Selecione os estados. Deixe em branco para ver todo o Brasil.
          </p>
        </div>

        <div className="space-y-5">
          {REGIOES.map((regiao) => (
            <div key={regiao.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {regiao.label}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {regiao.estados.map((estado) => {
                  const isSelected = selecionados.includes(estado.value);
                  return (
                    <button
                      key={estado.value}
                      onClick={() => toggleEstado(estado.value)}
                      className={`p-2.5 rounded-lg border text-sm font-medium text-center transition-all ${
                        isSelected
                          ? "border-blue-900 bg-blue-50 text-blue-900"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {estado.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Opções de modalidade/localização */}
        <div className="mt-6 space-y-3">
          <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <Checkbox
              id="ead"
              checked={aceitaEad}
              onCheckedChange={(v) => setAceitaEad(Boolean(v))}
            />
            <label htmlFor="ead" className="text-sm text-gray-700 cursor-pointer">
              Aceito programas EaD e semipresenciais
            </label>
          </div>

          <button
            onClick={() => setAceitaInternacional(!aceitaInternacional)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              aceitaInternacional
                ? "border-blue-900 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-3xl">🌍</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${aceitaInternacional ? "text-blue-900" : "text-gray-900"}`}>
                Também quero bolsas internacionais
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                CAPES, CNPq, Fulbright, DAAD, JSPS, Erasmus e mais
              </p>
            </div>
            {aceitaInternacional && <span className="text-blue-900">✓</span>}
          </button>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={handleContinuar}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white h-12"
          >
            {selecionados.length === 0
              ? "Ver todo o Brasil"
              : `Continuar (${selecionados.length} estado${selecionados.length > 1 ? "s" : ""})`}
          </Button>
        </div>
      </div>
    </main>
  );
}
