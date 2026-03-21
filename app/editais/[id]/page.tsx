import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UniversityAvatar } from "@/components/posgrad/university-avatar";
import {
  MOCK_EDITAIS,
  NIVEL_LABELS,
  GRANDE_AREA_LABELS,
  GRANDES_AREAS,
  calcularDiasRestantes,
} from "@/lib/mock-data";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditalPage({ params }: Props) {
  const { id } = await params;
  const edital = MOCK_EDITAIS.find((e) => e.id === id);

  if (!edital) notFound();

  const dias = calcularDiasRestantes(edital.prazo_inscricao);
  const areaInfo = GRANDES_AREAS.find((a) => a.value === edital.grande_area);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            ← Voltar
          </Link>
          <span className="font-bold text-gray-900">Edital</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Card principal */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {/* Cabeçalho com logo da universidade */}
          <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-100">
            <UniversityAvatar sigla={edital.ies_sigla} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 text-lg leading-snug">
                {edital.programa_nome}
              </h1>
              <p className="text-gray-600 text-sm mt-1 font-medium">
                {edital.ies_nome}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {edital.cidade} / {edital.estado}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-xl ${
                dias <= 7
                  ? "bg-red-50 text-red-700 border border-red-100"
                  : dias <= 30
                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}
            >
              {dias} dias
            </span>
          </div>

          {/* Dots de nível */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((i) => {
              const filled = edital.nivel === "doutorado" ? 3 : edital.nivel === "mestrado" ? 2 : 1;
              return (
                <span
                  key={i}
                  className={`block w-2 h-2 rounded-full ${i <= filled ? "bg-gray-800" : "bg-gray-200"}`}
                />
              );
            })}
            <span className="text-xs text-gray-500 font-medium ml-1">{NIVEL_LABELS[edital.nivel]}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Área", value: `${areaInfo?.emoji} ${GRANDE_AREA_LABELS[edital.grande_area]}` },
              { label: "Localização", value: `${edital.cidade} / ${edital.estado}` },
              { label: "Modalidade", value: edital.modalidade.charAt(0).toUpperCase() + edital.modalidade.slice(1) },
              { label: "Vagas", value: edital.vagas.toString() },
              { label: "Bolsas", value: edital.bolsas_disponiveis ? "Disponíveis" : "Não disponíveis" },
              { label: "Prazo de inscrição", value: new Date(edital.prazo_inscricao + "T12:00:00").toLocaleDateString("pt-BR") },
              { label: "Fonte", value: edital.fonte.toUpperCase() },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-0.5">{item.label}</p>
                <p className="font-medium text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Próximos passos</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p>✅ Leia o edital completo na página da instituição</p>
            <p>✅ Verifique os documentos necessários</p>
            <p>✅ Prepare carta de intenções e currículo</p>
          </div>
          <a href={edital.link_edital} target="_blank" rel="noopener noreferrer"
            className={cn(buttonVariants(), "w-full bg-blue-900 hover:bg-blue-900 text-white")}>
            Acessar edital oficial →
          </a>
        </div>

        {/* CTA plano */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 text-center">
          <p className="text-blue-900 font-medium mb-1">
            Quer ser notificado quando novos editais abrirem?
          </p>
          <p className="text-blue-900 text-sm mb-3">
            Assine e receba alertas no mesmo dia. A partir de R$9,90/mês.
          </p>
          <Link href="/#planos" className={cn(buttonVariants(), "bg-blue-900 hover:bg-blue-900 text-white")}>
            Ver planos →
          </Link>
        </div>
      </div>
    </main>
  );
}
