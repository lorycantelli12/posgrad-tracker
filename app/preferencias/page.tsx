"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GRANDES_AREAS,
  ESTADOS,
  type GrandeArea,
  type Nivel,
  type UF,
} from "@/lib/mock-data";

const NIVEIS: { value: Nivel; label: string }[] = [
  { value: "mestrado",             label: "Mestrado" },
  { value: "mestrado_profissional", label: "Mestrado Profissional" },
  { value: "doutorado",            label: "Doutorado" },
  { value: "pos_doutorado",        label: "Pós-Doutorado" },
];

const DESTINOS_INTL = [
  { value: "europa",        label: "Europa",           emoji: "🇪🇺", desc: "Erasmus, DAAD, Marie Curie, Euraxess" },
  { value: "america_norte", label: "América do Norte", emoji: "🇺🇸", desc: "Fulbright, CAPES/CNPq" },
  { value: "japao",         label: "Japão",            emoji: "🇯🇵", desc: "JSPS, MEXT, Monbukagakusho" },
  { value: "china",         label: "China",            emoji: "🇨🇳", desc: "Governo Chinês, CSC" },
  { value: "outros",        label: "Outros países",    emoji: "🌍", desc: "CAPES bilaterais e mais" },
];

function lerSS<T>(key: string, fallback: T): T {
  try {
    const v = sessionStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

export default function PreferenciasPage() {
  const router = useRouter();
  const [areas,       setAreas]       = useState<GrandeArea[]>(() => lerSS("posgrad_areas", []));
  const [niveis,      setNiveis]      = useState<Nivel[]>(() => lerSS("posgrad_niveis", []));
  const [querBrasil,  setQuerBrasil]  = useState<boolean>(() => lerSS("posgrad_quer_brasil", true));
  const [querExterior, setQuerExterior] = useState<boolean>(() => {
    const paises = lerSS<string[]>("posgrad_paises", []);
    return paises.length > 0 || lerSS("posgrad_internacional", false);
  });
  const [estados,     setEstados]     = useState<UF[]>(() => lerSS("posgrad_estados", []));
  const [paises,      setPaises]      = useState<string[]>(() => lerSS("posgrad_paises", []));
  const [aceita_ead,  setAceitaEad]   = useState<boolean>(() => lerSS("posgrad_ead", false));
  const [saved, setSaved] = useState(false);

  function toggle<T>(list: T[], setList: (v: T[]) => void, value: T) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function handleSalvar() {
    sessionStorage.setItem("posgrad_areas",         JSON.stringify(areas));
    sessionStorage.setItem("posgrad_niveis",        JSON.stringify(niveis));
    sessionStorage.setItem("posgrad_quer_brasil",   JSON.stringify(querBrasil));
    sessionStorage.setItem("posgrad_estados",       JSON.stringify(estados));
    sessionStorage.setItem("posgrad_ead",           JSON.stringify(aceita_ead));
    sessionStorage.setItem("posgrad_paises",        JSON.stringify(paises));
    setSaved(true);
    setTimeout(() => router.push("/dashboard"), 800);
  }

  if (saved) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="font-semibold text-gray-900">Preferências salvas!</p>
          <p className="text-gray-500 text-sm mt-1">Redirecionando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Voltar</Link>
          <span className="font-semibold text-gray-900">Minhas preferências</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* Áreas */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-1">Áreas de interesse</h2>
          <p className="text-xs text-gray-500 mb-3">Selecione uma ou mais grandes áreas</p>
          <div className="flex flex-wrap gap-2">
            {GRANDES_AREAS.map((a) => (
              <button
                key={a.value}
                onClick={() => toggle(areas, setAreas, a.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  areas.includes(a.value)
                    ? "bg-blue-900 text-white border-blue-900"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-900"
                }`}
              >
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
          {areas.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">Nenhuma selecionada = todas as áreas</p>
          )}
        </section>

        {/* Níveis */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-1">Nível</h2>
          <p className="text-xs text-gray-500 mb-3">Selecione os níveis de interesse</p>
          <div className="flex flex-wrap gap-2">
            {NIVEIS.map((n) => (
              <button
                key={n.value}
                onClick={() => toggle(niveis, setNiveis, n.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  niveis.includes(n.value)
                    ? "bg-blue-900 text-white border-blue-900"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-900"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </section>

        {/* Localização */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-1">Onde você quer estudar?</h2>
          <p className="text-xs text-gray-500 mb-3">Pode selecionar os dois</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setQuerBrasil(!querBrasil)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                querBrasil ? "border-blue-900 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl block mb-1">🇧🇷</span>
              <p className={`font-semibold text-sm ${querBrasil ? "text-blue-900" : "text-gray-900"}`}>No Brasil</p>
              {querBrasil && <span className="text-blue-900 text-xs">✓</span>}
            </button>
            <button
              onClick={() => setQuerExterior(!querExterior)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                querExterior ? "border-blue-900 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl block mb-1">🌍</span>
              <p className={`font-semibold text-sm ${querExterior ? "text-blue-900" : "text-gray-900"}`}>No exterior</p>
              {querExterior && <span className="text-blue-900 text-xs">✓</span>}
            </button>
          </div>

          {/* Estados (Brasil) */}
          {querBrasil && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Estados — deixe em branco para todo o Brasil</p>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {ESTADOS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => toggle(estados, setEstados, e.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      estados.includes(e.value)
                        ? "bg-blue-900 text-white border-blue-900"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-900"
                    }`}
                  >
                    {e.value}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Checkbox
                  id="ead"
                  checked={aceita_ead}
                  onCheckedChange={(v) => setAceitaEad(Boolean(v))}
                />
                <label htmlFor="ead" className="text-sm text-gray-700 cursor-pointer">
                  Aceito programas EaD e semipresenciais
                </label>
              </div>
            </div>
          )}

          {/* Regiões internacionais */}
          {querExterior && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Regiões de interesse — deixe em branco para todas</p>
              <div className="space-y-2">
                {DESTINOS_INTL.map((d) => {
                  const isSelected = paises.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      onClick={() => toggle(paises, setPaises, d.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected ? "border-blue-900 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{d.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${isSelected ? "text-blue-900" : "text-gray-900"}`}>{d.label}</p>
                        <p className="text-xs text-gray-500">{d.desc}</p>
                      </div>
                      {isSelected && <span className="text-blue-900 text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Resumo */}
        {(areas.length > 0 || niveis.length > 0 || estados.length > 0 || paises.length > 0) && (
          <section className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Resumo do seu perfil</p>
            <div className="flex flex-wrap gap-1.5">
              {areas.map((a) => <Badge key={a} variant="outline" className="text-xs">{a.replace(/_/g, " ")}</Badge>)}
              {niveis.map((n) => <Badge key={n} className="text-xs bg-blue-50 text-blue-700 border-0">{n.replace(/_/g, " ")}</Badge>)}
              {querBrasil && estados.length === 0 && <Badge className="text-xs bg-gray-100 text-gray-600 border-0">🇧🇷 Todo o Brasil</Badge>}
              {estados.map((e) => <Badge key={e} className="text-xs bg-gray-100 text-gray-600 border-0">{e}</Badge>)}
              {aceita_ead && <Badge className="text-xs bg-green-50 text-green-700 border-0">EaD</Badge>}
              {querExterior && paises.length === 0 && <Badge className="text-xs bg-blue-50 text-blue-800 border-0">🌍 Todo o exterior</Badge>}
              {paises.map((p) => {
                const d = DESTINOS_INTL.find((x) => x.value === p);
                return d ? <Badge key={p} className="text-xs bg-blue-50 text-blue-800 border-0">{d.emoji} {d.label}</Badge> : null;
              })}
            </div>
          </section>
        )}

        <Button
          onClick={handleSalvar}
          disabled={!querBrasil && !querExterior}
          className="w-full bg-blue-900 hover:bg-blue-950 text-white h-12 text-base"
        >
          Salvar preferências
        </Button>
      </div>
    </main>
  );
}
