"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { fetchEditaisComScore } from "@/lib/editais";
import { UniversityAvatar } from "@/components/posgrad/university-avatar";
import {
  NIVEL_LABELS,
  GRANDE_AREA_LABELS,
  calcularDiasRestantes,
  type Edital,
  type GrandeArea,
  type UF,
  type Nivel,
  type UserPreferences,
} from "@/lib/mock-data";

const FILTROS_NIVEL = [
  { value: "todos", label: "Todos" },
  { value: "mestrado", label: "Mestrado" },
  { value: "mestrado_profissional", label: "M. Profissional" },
  { value: "doutorado", label: "Doutorado" },
  { value: "pos_doutorado", label: "Pós-Doutorado" },
  { value: "internacional", label: "🌐 Internacional" },
] as const;

export default function DashboardPage() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [temPrefs, setTemPrefs] = useState(false);

  useEffect(() => {
    const areas = JSON.parse(sessionStorage.getItem("posgrad_areas") || "[]") as GrandeArea[];
    const micro_areas = JSON.parse(sessionStorage.getItem("posgrad_micro_areas") || "[]") as string[];
    const estados = JSON.parse(sessionStorage.getItem("posgrad_estados") || "[]") as UF[];
    const niveis = JSON.parse(sessionStorage.getItem("posgrad_niveis") || "[]") as Nivel[];
    const aceita_ead = JSON.parse(sessionStorage.getItem("posgrad_ead") || "false") as boolean;

    const paises = JSON.parse(sessionStorage.getItem("posgrad_paises") || "[]") as string[];
    const quer_brasil = JSON.parse(sessionStorage.getItem("posgrad_quer_brasil") || "true") as boolean;

    const prefs: UserPreferences = { grandes_areas: areas, micro_areas, estados, niveis, aceita_ead, paises, quer_brasil };
    const hasPrefs = areas.length > 0 || estados.length > 0 || niveis.length > 0;
    setTemPrefs(hasPrefs);

    fetchEditaisComScore(hasPrefs ? prefs : { grandes_areas: [], micro_areas: [], estados: [], niveis: [], aceita_ead: false, paises: [], quer_brasil: true }).then(setEditais);
  }, []);

  const editaisFiltrados = editais.filter((e) => {
    const matchNivel =
      filtroNivel === "todos" ||
      (filtroNivel === "internacional" ? e.internacional === true : e.nivel === filtroNivel && !e.internacional);
    const matchBusca =
      busca === "" ||
      e.programa_nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.ies_nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.ies_sigla.toLowerCase().includes(busca.toLowerCase());
    return matchNivel && matchBusca;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-gray-900">🎓 PosGrad</span>
          <div className="flex items-center gap-2">
            <Link href="/preferencias" className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-gray-600")}>
              ⚙️ Preferências
            </Link>
            <Link href="/cadastro" className={cn(buttonVariants({ size: "sm" }), "bg-blue-900 hover:bg-blue-950 text-white")}>
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Aviso de filtro ativo */}
        {temPrefs && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-4 text-sm">
            <span className="text-blue-900">🎯 Mostrando editais do seu perfil</span>
            <Link href="/preferencias" className="text-blue-700 underline text-xs">Editar</Link>
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { num: editais.length, label: "Abertos" },
            { num: editais.filter((e) => calcularDiasRestantes(e.prazo_inscricao) <= 30).length, label: "Encerram em 30d" },
            { num: editais.filter((e) => e.bolsas_disponiveis).length, label: "Com bolsa" },
            { num: editais.filter((e) => e.internacional).length, label: "Internacionais" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="text-xl font-bold text-blue-900">{stat.num}</div>
              <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Busca */}
        <input
          type="search"
          placeholder="Buscar por programa ou universidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
        />

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {FILTROS_NIVEL.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltroNivel(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filtroNivel === f.value
                  ? "bg-blue-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {editaisFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">Nenhum edital encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {editaisFiltrados.map((edital) => (
              <EditalCard key={edital.id} edital={edital} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/** Dots indicadores de nível acadêmico */
function NivelDots({ nivel }: { nivel: string }) {
  const dots = nivel === "doutorado" ? 3 : nivel === "mestrado" ? 2 : 1;
  const label = NIVEL_LABELS[nivel as keyof typeof NIVEL_LABELS] ?? nivel;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`block w-1.5 h-1.5 rounded-full ${
              i <= dots ? "bg-gray-800" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] text-gray-500 font-medium">{label}</span>
    </div>
  );
}

function EditalCard({ edital }: { edital: Edital }) {
  const dias = calcularDiasRestantes(edital.prazo_inscricao);
  const urgente = dias <= 7;
  const proximo = dias <= 30;

  const prazoColor = urgente
    ? "text-red-600 font-semibold"
    : proximo
    ? "text-amber-600 font-semibold"
    : "text-gray-400";

  return (
    <Link href={`/editais/${edital.id}`}>
      <div className={`bg-white rounded-2xl p-4 border hover:shadow-sm transition-all active:scale-[0.99] ${
        edital.internacional
          ? "border-blue-200 hover:border-blue-300"
          : "border-gray-100 hover:border-gray-300"
      }`}>
        {/* Badge internacional */}
        {edital.internacional && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              🌐 Internacional
            </span>
            {edital.pais_destino && (
              <span className="text-[11px] text-blue-500">{edital.pais_destino}</span>
            )}
          </div>
        )}

        {/* Linha principal */}
        <div className="flex items-start gap-3">
          <UniversityAvatar sigla={edital.ies_sigla} size="md" />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
              {edital.programa_nome}
            </p>
            <p className="text-gray-400 text-xs mt-0.5 truncate">
              {edital.ies_sigla} · {edital.internacional ? (edital.pais_destino ?? "Exterior") : `${edital.cidade}/${edital.estado}`}
            </p>
          </div>

          {/* Prazo */}
          <span className={`shrink-0 text-xs ${prazoColor}`}>
            {urgente && "⚠ "}{dias}d
          </span>
        </div>

        {/* Meta linha */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <NivelDots nivel={edital.nivel} />

          <div className="flex items-center gap-2">
            {edital.modalidade === "ead" && (
              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-medium">EaD</span>
            )}
            {edital.bolsas_disponiveis && (
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">+ Bolsa</span>
            )}
            <span className="text-[10px] text-gray-300">
              {new Date(edital.prazo_inscricao + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
