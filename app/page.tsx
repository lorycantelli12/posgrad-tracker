import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { UniversityAvatar } from "@/components/posgrad/university-avatar";
import { UNIVERSIDADES_DESTAQUE } from "@/lib/ies-data";

const FAQ = [
  {
    q: "Isso realmente funciona ou é mais um agregador desatualizado?",
    a: "Não é. A maioria dos agregadores atualiza semanalmente — ou quando lembram. A gente roda o monitoramento todo dia às 6h, direto nas fontes primárias: DOU, CAPES e os sites oficiais de cada IES. Se o edital saiu hoje, você recebe hoje.",
  },
  {
    q: "Quais universidades vocês monitoram?",
    a: "Mais de 100 IES federais e estaduais do Brasil (CAPES Sucupira + DOU + sites das universidades), mais as principais internacionais: Alemanha (TU Munich, Heidelberg, RWTH Aachen via DAAD/EURAXESS), EUA (MIT, Stanford, Harvard via Fulbright/NSF), Austrália (Melbourne, ANU, Sydney via Australia Awards) e Canadá (Toronto, UBC, McGill via EduCanada). Se o edital é público, a gente encontra.",
  },
  {
    q: "E se eu não quiser pagar nada?",
    a: "A busca pontual é gratuita para sempre. Você entra, pesquisa os editais abertos agora e vê tudo. O monitoramento contínuo com notificação push é o plano pago — a partir de R$9,90/mês.",
  },
  {
    q: "Por que pagar R$9,90 por mês?",
    a: "Para não depender da sua memória. Sem assinatura, você precisa entrar toda semana e checar. Com assinatura, você configura uma vez e recebe o aviso quando abre. Se um edital do seu programa abre e fecha em 45 dias, você tem 45 dias para agir — não 3, que é o tempo que levaria para descobrir por conta própria.",
  },
  {
    q: "Qual a diferença entre mensal e semestral?",
    a: "Os recursos são os mesmos. No semestral você paga R$49,90 por 6 meses (equivale a R$8,32/mês), economizando R$9,50 em relação ao mensal.",
  },
  {
    q: "Vou receber spam?",
    a: "Não. Máximo 3 notificações por dia, só para editais compatíveis com o seu perfil. Se não abriu nada relevante, você não recebe nada.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem fidelidade, sem multa, sem formulário de retenção. Cancela em um clique.",
  },
];

const PLANOS = [
  {
    id: "free",
    nome: "Pesquisa",
    preco: "Grátis",
    sub: "sem cadastro",
    destaque: false,
    badge: null,
    descricao: "Pesquise editais abertos agora, sem criar conta.",
    itens: [
      { ok: true, texto: "Busca pontual de editais" },
      { ok: true, texto: "Filtro por área, estado e nível" },
      { ok: true, texto: "Link direto para o edital oficial" },
      { ok: false, texto: "Monitoramento contínuo" },
      { ok: false, texto: "Notificações por push" },
      { ok: false, texto: "Perfil salvo" },
    ],
    cta: "Buscar editais agora",
    href: "/dashboard",
  },
  {
    id: "mensal",
    nome: "Mensal",
    preco: "R$9,90",
    sub: "por mês",
    destaque: true,
    badge: "Mais popular",
    descricao: "Monitoramento diário e notificação no mesmo dia que o edital abre.",
    itens: [
      { ok: true, texto: "Tudo do plano Pesquisa" },
      { ok: true, texto: "Alerta imediato de novos editais" },
      { ok: true, texto: "Resumo semanal por e-mail / push" },
      { ok: true, texto: "Perfil salvo com suas preferências" },
      { ok: true, texto: "Histórico de editais" },
      { ok: true, texto: "Cancele quando quiser" },
    ],
    cta: "Assinar mensal",
    href: "/cadastro?plano=mensal",
  },
  {
    id: "semestral",
    nome: "Semestral",
    preco: "R$49,90",
    sub: "por 6 meses · R$8,32/mês",
    destaque: false,
    badge: "Melhor custo-benefício",
    descricao: "Todos os recursos do mensal. 16% mais barato.",
    itens: [
      { ok: true, texto: "Tudo do plano Mensal" },
      { ok: true, texto: "Alerta imediato de novos editais" },
      { ok: true, texto: "Resumo semanal por e-mail / push" },
      { ok: true, texto: "Perfil salvo com suas preferências" },
      { ok: true, texto: "Histórico de editais" },
      { ok: true, texto: "Economia de 16% vs. mensal" },
    ],
    cta: "Assinar semestral",
    href: "/cadastro?plano=semestral",
  },
];

const BENEFICIOS = [
  {
    title: "Você descobre no dia que abre",
    desc: "Editais ficam abertos em média 30 a 60 dias. Quem descobre na semana 1 tem tempo para preparar a documentação. Quem descobre na semana 4 corre ou desiste.",
    icon: (
      <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    title: "Zero ruído, só o que é seu",
    desc: "Você não recebe tudo — recebe só o que combina com sua área, nível e estado. Sem edital de agronomia quando você quer saúde pública.",
    icon: (
      <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
      </svg>
    ),
  },
  {
    title: "No celular, sem instalar nada",
    desc: "Funciona como app direto pelo navegador (PWA). Push no iOS e Android. Sem passar pela App Store.",
    icon: (
      <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
      </svg>
    ),
  },
  {
    title: "Você controla o volume",
    desc: "Máximo 3 notificações por dia. Se a semana estiver quieta, você não recebe nada. Sem flood na notificação.",
    icon: (
      <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">PosGrad Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Buscar editais
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center h-9 px-4 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-sm font-medium transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — azul marinho */}
      <section className="relative overflow-hidden bg-blue-950 text-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-[-20%] left-[60%] w-96 h-96 bg-blue-800/30 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[15%] w-72 h-72 bg-blue-700/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 pt-20 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-100 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Mestrado · Doutorado · Pós-Doc · Bolsas Internacionais
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5">
            O edital que vai mudar sua carreira<br />
            <span className="text-blue-300">
              tem prazo de 30 dias.
            </span>
          </h1>

          <p className="text-lg text-blue-200/80 mb-8 max-w-xl mx-auto leading-relaxed">
            São 7.000 programas publicados em 100+ universidades, cada uma com seu próprio site,
            seu próprio calendário, seu próprio edital. Nenhum candidato consegue acompanhar tudo
            manualmente. Editais abrem, ficam 30 a 60 dias no ar, e fecham — sem avisar ninguém.
          </p>

          {/* Níveis monitorados */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { label: "Mestrado", icon: "📖" },
              { label: "Mestrado Profissional", icon: "💼" },
              { label: "Doutorado", icon: "🏆" },
              { label: "Pós-Doutorado", icon: "🔬" },
              { label: "Bolsas Internacionais", icon: "🌐" },
            ].map((n) => (
              <span key={n.label} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-blue-100 text-xs font-medium px-3 py-1.5 rounded-full">
                <span>{n.icon}</span> {n.label}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-semibold text-base transition-all shadow-lg hover:-translate-y-0.5"
            >
              Quero ser avisado antes que feche →
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-white/25 hover:bg-white/10 text-blue-100 hover:text-white font-medium text-base transition-all"
            >
              Buscar editais abertos agora
            </Link>
          </div>

          {/* Prova do problema */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {[
              { num: "7.000+", label: "programas ativos no CAPES Sucupira" },
              { num: "30–60", label: "dias que um edital fica aberto, em média" },
              { num: "100+", label: "sites diferentes publicando editais" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span className="font-bold text-white">{item.num}</span>
                <span className="text-blue-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universidades monitoradas */}
      <section className="border-b border-gray-100 py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-medium mb-6">
            Monitoramos editais de mais de 100 universidades, incluindo
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {UNIVERSIDADES_DESTAQUE.map((u) => (
              <div
                key={u.sigla}
                className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-100 transition-colors"
              >
                <UniversityAvatar sigla={u.sigla} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-none">{u.sigla}</p>
                  <p className="text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:block">{u.nome.split(" ").slice(0, 3).join(" ")}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 bg-blue-900 rounded-xl px-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                +88
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-none">e mais</p>
                <p className="text-[10px] text-blue-300 leading-none mt-0.5 hidden sm:block">federais, estaduais</p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
            {[
              { label: "DOU Federal", sub: "monitorado diariamente" },
              { label: "CAPES Sucupira", sub: "todos os programas" },
              { label: "100+ IES", sub: "federais e estaduais" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs">
                <CheckIcon className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="font-medium text-gray-700">{b.label}</span>
                <span className="text-gray-400">{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2 tracking-tight">
          Funciona enquanto você vive sua vida
        </h2>
        <p className="text-center text-gray-500 text-sm mb-14">3 passos. Leva menos de 2 minutos.</p>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-0 relative">
          <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 z-0" aria-hidden />

          {[
            {
              num: "01",
              icon: (
                <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: "Configure uma vez",
              desc: "Escolha sua área (ex: Ciências da Saúde), os estados e o nível — mestrado, doutorado ou ambos. Leva 2 minutos.",
            },
            {
              num: "02",
              icon: (
                <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              ),
              title: "A gente monitora todo dia",
              desc: "Às 6h da manhã varremos o DOU, a CAPES e mais de 100 sites de universidades. Você não precisa entrar em nenhum deles.",
            },
            {
              num: "03",
              icon: (
                <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              ),
              title: "Você recebe o alerta na hora certa",
              desc: "Quando um edital compatível abre, você recebe push com o nome do programa, a IES, o prazo final e o link direto. Sem precisar procurar nada.",
            },
          ].map((item, i) => (
            <div key={item.num}>
              <div className="relative z-10 flex flex-col items-center text-center px-6 py-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase mb-1">
                  Passo {item.num}
                </span>
                <h3 className="font-semibold text-gray-900 text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
              {i < 2 && (
                <div className="flex justify-center md:hidden" aria-hidden>
                  <div className="w-px h-8 bg-blue-100" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats — o problema em números */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-blue-950 rounded-3xl px-8 py-12">
            <p className="text-center text-blue-400 text-xs uppercase tracking-widest font-medium mb-8">
              Por que candidatos perdem editais todo mês
            </p>
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { num: "7.000+", label: "Programas para acompanhar", sub: "mestrado, doutorado e pós-doc no CAPES" },
                { num: "100+", label: "Sites diferentes", sub: "cada universidade publica no próprio domínio" },
                { num: "45 dias", label: "Janela média de inscrição", sub: "quem descobre tarde, não tem tempo" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <div className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                    {stat.num}
                  </div>
                  <div className="text-blue-200 text-sm font-medium mt-1">{stat.label}</div>
                  <div className="text-blue-400 text-xs mt-0.5 hidden sm:block">{stat.sub}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-blue-300 text-sm mt-8 max-w-md mx-auto">
              Nenhum candidato consegue monitorar tudo isso manualmente.<br />
              <span className="text-white font-medium">É para isso que o PosGrad Tracker existe.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Internacional + Pós-Doc destaque */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-5">

          {/* Pós-Doutorado */}
          <div className="bg-blue-950 rounded-2xl p-6 text-white">
            <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center text-lg mb-4">🔬</div>
            <h3 className="font-bold text-lg mb-2">Pós-Doutorado</h3>
            <p className="text-blue-300 text-sm leading-relaxed mb-4">
              Monitoramos editais e chamadas de pós-doc em universidades brasileiras, CAPES e CNPq.
              Configure seu perfil com "Pós-Doutorado" e receba alertas assim que uma vaga abrir
              na sua área.
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                "Chamadas de pós-doc em 100+ IES",
                "CAPES e CNPq bolsas pós-doutorado",
                "DOU — editais de pesquisa avançada",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-blue-200">
                  <CheckIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Internacional */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg mb-4">🌐</div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Bolsas Internacionais</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-3">
              Monitore bolsas e vagas de pesquisa no exterior — doutorado sanduíche,
              pós-doc e programas de mestrado/doutorado pleno em 4 países.
            </p>
            <div className="flex gap-2 mb-4">
              {["🇩🇪", "🇺🇸", "🇦🇺", "🇨🇦"].map((flag) => (
                <span key={flag} className="text-xl">{flag}</span>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                "Alemanha — DAAD, TU Munich, Heidelberg",
                "EUA — Fulbright, MIT, Stanford, Harvard",
                "Austrália — Australia Awards, Melbourne, ANU",
                "Canadá — EduCanada, Toronto, UBC, McGill",
                "Brasil — CAPES PDSE, CNPq, PRINT",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckIcon className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Cobertura Internacional — detalhe por país */}
      <section className="bg-blue-950 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-tight">
            Cobertura internacional
          </h2>
          <p className="text-blue-300 text-sm text-center mb-10">
            20+ universidades de ponta monitoradas em 4 países
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                flag: "🇩🇪",
                pais: "Alemanha",
                portal: "DAAD + EURAXESS",
                universidades: ["TU Munich", "LMU Munich", "Heidelberg", "Humboldt Berlin", "RWTH Aachen"],
              },
              {
                flag: "🇺🇸",
                pais: "EUA",
                portal: "Fulbright + NSF",
                universidades: ["MIT", "Stanford", "Harvard", "UC Berkeley", "Columbia"],
              },
              {
                flag: "🇦🇺",
                pais: "Austrália",
                portal: "Australia Awards",
                universidades: ["U. Melbourne", "ANU", "U. Sydney", "UNSW", "U. Queensland"],
              },
              {
                flag: "🇨🇦",
                pais: "Canadá",
                portal: "EduCanada + NSERC",
                universidades: ["U. Toronto", "UBC", "McGill", "U. Alberta", "McMaster"],
              },
            ].map((p) => (
              <div key={p.pais} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{p.flag}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{p.pais}</p>
                    <p className="text-blue-400 text-[11px]">{p.portal}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {p.universidades.map((u) => (
                    <div key={u} className="flex items-center gap-1.5 text-xs text-blue-200">
                      <div className="w-1 h-1 bg-blue-400 rounded-full shrink-0" />
                      {u}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4 pt-6 border-t border-white/10">
            {[
              { label: "CAPES PDSE", sub: "doutorado sanduíche" },
              { label: "CNPq Exterior", sub: "pós-doc e pesquisa" },
              { label: "PRINT CAPES", sub: "internacionalização" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs">
                <CheckIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-medium text-blue-200">{b.label}</span>
                <span className="text-blue-400">{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2 tracking-tight">
            Planos
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            Pesquise de graça. Assine para nunca perder um edital.
          </p>

          <div className="flex justify-center mb-10">
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-700 rounded-full" />
              Semestral: economize R$9,50 em relação ao mensal
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {PLANOS.map((plano, idx) => (
              <div
                key={plano.id}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plano.destaque
                    ? "bg-blue-950 text-white shadow-2xl shadow-blue-900/30 ring-1 ring-inset ring-white/10 md:-mt-2"
                    : plano.id === "semestral"
                    ? "bg-white border border-blue-200 shadow-sm md:mt-4"
                    : "bg-white border border-gray-200 shadow-sm md:mt-4"
                } ${idx === 1 ? "order-first md:order-none" : ""}`}
              >
                {plano.badge && (
                  <div className={`inline-flex self-start text-[11px] font-bold px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase ${
                    plano.destaque
                      ? "bg-white text-blue-900"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}>
                    {plano.badge}
                  </div>
                )}

                <div className="mb-5">
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${plano.destaque ? "text-blue-400" : "text-gray-400"}`}>
                    {plano.nome}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${plano.destaque ? "text-white" : "text-gray-900"}`}>
                      {plano.preco}
                    </span>
                    {plano.sub && (
                      <span className={`text-xs ${plano.destaque ? "text-blue-400" : "text-gray-400"}`}>
                        {plano.sub}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${plano.destaque ? "text-blue-300" : "text-gray-500"}`}>
                    {plano.descricao}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plano.itens.map((item) => (
                    <li key={item.texto} className="flex items-start gap-2 text-sm">
                      {item.ok
                        ? <CheckIcon className={`w-4 h-4 mt-0.5 shrink-0 ${plano.destaque ? "text-blue-300" : "text-blue-700"}`} />
                        : <XIcon className={`w-4 h-4 mt-0.5 shrink-0 opacity-25 ${plano.destaque ? "text-blue-400" : "text-gray-400"}`} />
                      }
                      <span className={item.ok ? (plano.destaque ? "text-blue-100" : "text-gray-700") : (plano.destaque ? "text-blue-500" : "text-gray-400")}>
                        {item.texto}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plano.href}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full text-center",
                    plano.destaque
                      ? "bg-white text-blue-900 hover:bg-blue-50"
                      : plano.id === "free"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-900 text-white hover:bg-blue-950"
                  )}
                >
                  {plano.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10 tracking-tight">
          Por que usar o PosGrad Tracker
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {BENEFICIOS.map((item) => (
            <div
              key={item.title}
              className="group flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10 tracking-tight">
          Perguntas frequentes
        </h2>
        <div className="space-y-2">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group border border-gray-200 rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-blue-50 transition-colors">
                <span className="font-semibold text-gray-900 text-sm pr-4">{item.q}</span>
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 pt-1 border-t border-gray-100">
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-blue-950 py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Tem um edital aberto agora para a sua área
          </h2>
          <p className="text-blue-200/80 mb-8 leading-relaxed">
            Pesquise de graça e veja. Se quiser ser avisado nos próximos,
            assine por R$9,90 — menos que um café por semana para não perder
            a vaga que você vem planejando faz anos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-white/25 hover:bg-white/10 text-blue-100 hover:text-white font-medium text-base transition-all"
            >
              Ver editais abertos agora
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-semibold text-base transition-all shadow-md hover:-translate-y-0.5"
            >
              Assinar e nunca mais perder um edital →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>PosGrad Tracker · Feito para quem quer fazer pós-graduação no Brasil</p>
      </footer>

    </main>
  );
}
