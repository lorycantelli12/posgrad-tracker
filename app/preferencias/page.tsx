"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GRANDES_AREAS,
  ESTADOS,
  type GrandeArea,
  type Nivel,
  type UF,
} from "@/lib/mock-data";

const NIVEIS: { value: Nivel; label: string }[] = [
  { value: "mestrado", label: "Mestrado" },
  { value: "mestrado_profissional", label: "Mestrado Profissional" },
  { value: "doutorado", label: "Doutorado" },
  { value: "pos_doutorado", label: "Pós-Doutorado" },
];

function lerSS<T>(key: string, fallback: T): T {
  try {
    const v = sessionStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

export default function PreferenciasPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<GrandeArea[]>(() => lerSS("posgrad_areas", []));
  const [estados, setEstados] = useState<UF[]>(() => lerSS("posgrad_estados", []));
  const [niveis, setNiveis] = useState<Nivel[]>(() => lerSS("posgrad_niveis", []));
  const [aceita_ead, setAceitaEad] = useState<boolean>(() => lerSS("posgrad_ead", false));
  const [aceita_internacional, setAceitaInternacional] = useState<boolean>(() => lerSS("posgrad_internacional", false));
  const [saved, setSaved] = useState(false);

  function toggle<T>(list: T[], setList: (v: T[]) => void, value: T) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function handleSalvar() {
    sessionStorage.setItem("posgrad_areas", JSON.stringify(areas));
    sessionStorage.setItem("posgrad_estados", JSON.stringify(estados));
    sessionStorage.setItem("posgrad_niveis", JSON.stringify(niveis));
    sessionStorage.setItem("posgrad_ead", JSON.stringify(aceita_ead));
    sessionStorage.setItem("posgrad_internacional", JSON.stringify(aceita_internacional));
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
      {/* Header */}
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

        {/* Estados */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-1">Estados</h2>
          <p className="text-xs text-gray-500 mb-3">Deixe em branco para qualquer estado</p>
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
          {estados.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">{estados.length} estado(s) selecionado(s)</p>
          )}
        </section>

        {/* EaD + Internacional */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-3">Modalidade</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setAceitaEad(!aceita_ead)}
                className={`w-10 h-6 rounded-full transition-colors relative ${aceita_ead ? "bg-blue-900" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${aceita_ead ? "left-5" : "left-1"}`} />
              </div>
              <span className="text-sm text-gray-700">Aceitar EaD / Semipresencial</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setAceitaInternacional(!aceita_internacional)}
                className={`w-10 h-6 rounded-full transition-colors relative ${aceita_internacional ? "bg-blue-900" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${aceita_internacional ? "left-5" : "left-1"}`} />
              </div>
              <span className="text-sm text-gray-700">Incluir bolsas internacionais (CAPES, CNPq, Fulbright)</span>
            </label>
          </div>
        </section>

        {/* Resumo */}
        {(areas.length > 0 || niveis.length > 0 || estados.length > 0) && (
          <section className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">Resumo do seu perfil</p>
            <div className="flex flex-wrap gap-1.5">
              {areas.map((a) => <Badge key={a} variant="outline" className="text-xs">{a.replace(/_/g, " ")}</Badge>)}
              {niveis.map((n) => <Badge key={n} className="text-xs bg-blue-50 text-blue-700 border-0">{n.replace(/_/g, " ")}</Badge>)}
              {estados.map((e) => <Badge key={e} className="text-xs bg-gray-100 text-gray-600 border-0">{e}</Badge>)}
              {aceita_ead && <Badge className="text-xs bg-green-50 text-green-700 border-0">EaD</Badge>}
              {aceita_internacional && <Badge className="text-xs bg-blue-50 text-blue-800 border-0">🌐 Internacional</Badge>}
            </div>
          </section>
        )}

        <Button
          onClick={handleSalvar}
          className="w-full bg-blue-900 hover:bg-blue-950 text-white h-12 text-base"
        >
          Salvar preferências
        </Button>
      </div>
    </main>
  );
}
