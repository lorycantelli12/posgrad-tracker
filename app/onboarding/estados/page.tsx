"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ESTADOS, type UF } from "@/lib/mock-data";
import { OnboardingProgress } from "@/components/posgrad/onboarding-progress";

const REGIOES_BR: { label: string; estados: typeof ESTADOS }[] = [
  { label: "Norte",        estados: ESTADOS.filter((e) => ["AC","AM","AP","PA","RO","RR","TO"].includes(e.value)) },
  { label: "Nordeste",     estados: ESTADOS.filter((e) => ["AL","BA","CE","MA","PB","PE","PI","RN","SE"].includes(e.value)) },
  { label: "Centro-Oeste", estados: ESTADOS.filter((e) => ["DF","GO","MS","MT"].includes(e.value)) },
  { label: "Sudeste",      estados: ESTADOS.filter((e) => ["ES","MG","RJ","SP"].includes(e.value)) },
  { label: "Sul",          estados: ESTADOS.filter((e) => ["PR","RS","SC"].includes(e.value)) },
];

const DESTINOS_INTL = [
  { value: "europa",        label: "Europa",             emoji: "🇪🇺", desc: "Erasmus, DAAD, Marie Curie, Euraxess" },
  { value: "america_norte", label: "América do Norte",   emoji: "🇺🇸", desc: "Fulbright, CAPES/CNPq" },
  { value: "japao",         label: "Japão",              emoji: "🇯🇵", desc: "JSPS, MEXT, Monbukagakusho" },
  { value: "china",         label: "China",              emoji: "🇨🇳", desc: "Governo Chinês, CSC" },
  { value: "outros",        label: "Outros países",      emoji: "🌍", desc: "CAPES bilaterais e mais" },
];

export default function EstadosPage() {
  const router = useRouter();
  const [querBrasil, setQuerBrasil] = useState(true);
  const [querExterior, setQuerExterior] = useState(false);
  const [estados, setEstados] = useState<UF[]>([]);
  const [paises, setPaises] = useState<string[]>([]);
  const [aceitaEad, setAceitaEad] = useState(false);

  function toggleEstado(uf: UF) {
    setEstados((prev) => prev.includes(uf) ? prev.filter((e) => e !== uf) : [...prev, uf]);
  }

  function togglePais(p: string) {
    setPaises((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  function handleContinuar() {
    sessionStorage.setItem("posgrad_estados", JSON.stringify(estados));
    sessionStorage.setItem("posgrad_ead", JSON.stringify(aceitaEad));
    sessionStorage.setItem("posgrad_paises", JSON.stringify(paises));
    sessionStorage.setItem("posgrad_quer_brasil", JSON.stringify(querBrasil));
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
            Pode selecionar os dois.
          </p>
        </div>

        {/* Toggles principais */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setQuerBrasil(!querBrasil)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              querBrasil
                ? "border-blue-900 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-2xl block mb-1">🇧🇷</span>
            <p className={`font-semibold text-sm ${querBrasil ? "text-blue-900" : "text-gray-900"}`}>
              No Brasil
            </p>
            {querBrasil && <span className="text-blue-900 text-xs">✓</span>}
          </button>

          <button
            onClick={() => setQuerExterior(!querExterior)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              querExterior
                ? "border-blue-900 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-2xl block mb-1">🌍</span>
            <p className={`font-semibold text-sm ${querExterior ? "text-blue-900" : "text-gray-900"}`}>
              No exterior
            </p>
            {querExterior && <span className="text-blue-900 text-xs">✓</span>}
          </button>
        </div>

        {/* Seção Brasil */}
        {querBrasil && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Estados — opcional, deixe em branco para todo o Brasil
            </p>
            <div className="space-y-4">
              {REGIOES_BR.map((regiao) => (
                <div key={regiao.label}>
                  <p className="text-xs font-medium text-gray-400 mb-2">{regiao.label}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {regiao.estados.map((estado) => {
                      const isSelected = estados.includes(estado.value);
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

            <div className="mt-4 p-4 rounded-xl border border-gray-200 flex items-center gap-3">
              <Checkbox
                id="ead"
                checked={aceitaEad}
                onCheckedChange={(v) => setAceitaEad(Boolean(v))}
              />
              <label htmlFor="ead" className="text-sm text-gray-700 cursor-pointer">
                Aceito programas EaD e semipresenciais
              </label>
            </div>
          </div>
        )}

        {/* Seção Exterior */}
        {querExterior && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Regiões de interesse — opcional, deixe em branco para todas
            </p>
            <div className="space-y-2">
              {DESTINOS_INTL.map((destino) => {
                const isSelected = paises.includes(destino.value);
                return (
                  <button
                    key={destino.value}
                    onClick={() => togglePais(destino.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-blue-900 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{destino.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                        {destino.label}
                      </p>
                      <p className="text-xs text-gray-500">{destino.desc}</p>
                    </div>
                    {isSelected && <span className="text-blue-900 text-sm">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={handleContinuar}
            disabled={!querBrasil && !querExterior}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white h-12"
          >
            Continuar
          </Button>
        </div>
      </div>
    </main>
  );
}
