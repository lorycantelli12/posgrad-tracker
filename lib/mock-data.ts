export type GrandeArea =
  | "ciencias_exatas"
  | "ciencias_biologicas"
  | "engenharias"
  | "ciencias_saude"
  | "ciencias_agrarias"
  | "ciencias_sociais_aplicadas"
  | "ciencias_humanas"
  | "linguistica_letras_artes"
  | "multidisciplinar";

export type Nivel =
  | "mestrado"
  | "mestrado_profissional"
  | "doutorado"
  | "pos_doutorado";

export type UF =
  | "AC" | "AL" | "AM" | "AP" | "BA" | "CE" | "DF" | "ES" | "GO"
  | "MA" | "MG" | "MS" | "MT" | "PA" | "PB" | "PE" | "PI" | "PR"
  | "RJ" | "RN" | "RO" | "RR" | "RS" | "SC" | "SE" | "SP" | "TO";

export interface MicroArea {
  value: string;
  label: string;
}

export const MICRO_AREAS: Record<GrandeArea, MicroArea[]> = {
  ciencias_exatas: [
    { value: "astronomia", label: "Astronomia" },
    { value: "ciencia_computacao", label: "Ciência da Computação" },
    { value: "fisica", label: "Física" },
    { value: "geociencias", label: "Geociências" },
    { value: "matematica", label: "Matemática" },
    { value: "oceanografia", label: "Oceanografia" },
    { value: "prob_estatistica", label: "Probabilidade e Estatística" },
    { value: "quimica", label: "Química" },
  ],
  ciencias_biologicas: [
    { value: "biofisica", label: "Biofísica" },
    { value: "biologia_geral", label: "Biologia Geral" },
    { value: "bioquimica", label: "Bioquímica" },
    { value: "botanica", label: "Botânica" },
    { value: "ecologia", label: "Ecologia" },
    { value: "farmacologia", label: "Farmacologia" },
    { value: "fisiologia", label: "Fisiologia" },
    { value: "genetica", label: "Genética" },
    { value: "imunologia", label: "Imunologia" },
    { value: "microbiologia", label: "Microbiologia" },
    { value: "morfologia", label: "Morfologia" },
    { value: "parasitologia", label: "Parasitologia" },
    { value: "zoologia", label: "Zoologia" },
  ],
  engenharias: [
    { value: "eng_aeroespacial", label: "Engenharia Aeroespacial" },
    { value: "eng_biomedica", label: "Engenharia Biomédica" },
    { value: "eng_civil", label: "Engenharia Civil" },
    { value: "eng_eletrica", label: "Engenharia Elétrica" },
    { value: "eng_materiais", label: "Engenharia de Materiais" },
    { value: "eng_mecanica", label: "Engenharia Mecânica" },
    { value: "eng_minas", label: "Engenharia de Minas" },
    { value: "eng_nuclear", label: "Engenharia Nuclear" },
    { value: "eng_producao", label: "Engenharia de Produção" },
    { value: "eng_quimica", label: "Engenharia Química" },
    { value: "eng_sanitaria", label: "Engenharia Sanitária" },
    { value: "eng_transportes", label: "Engenharia de Transportes" },
  ],
  ciencias_saude: [
    { value: "educacao_fisica", label: "Educação Física" },
    { value: "enfermagem", label: "Enfermagem" },
    { value: "farmacia", label: "Farmácia" },
    { value: "fisioterapia", label: "Fisioterapia e Terapia Ocupacional" },
    { value: "fonoaudiologia", label: "Fonoaudiologia" },
    { value: "medicina", label: "Medicina" },
    { value: "medicina_veterinaria", label: "Medicina Veterinária" },
    { value: "nutricao", label: "Nutrição" },
    { value: "odontologia", label: "Odontologia" },
    { value: "saude_coletiva", label: "Saúde Coletiva" },
  ],
  ciencias_agrarias: [
    { value: "agronomia", label: "Agronomia" },
    { value: "ciencia_alimentos", label: "Ciência e Tecnologia de Alimentos" },
    { value: "medicina_veterinaria_agro", label: "Medicina Veterinária" },
    { value: "recursos_florestais", label: "Recursos Florestais" },
    { value: "recursos_pesqueiros", label: "Recursos Pesqueiros" },
    { value: "zootecnia", label: "Zootecnia" },
  ],
  ciencias_sociais_aplicadas: [
    { value: "administracao", label: "Administração" },
    { value: "arquitetura_urbanismo", label: "Arquitetura e Urbanismo" },
    { value: "ciencia_informacao", label: "Ciência da Informação" },
    { value: "ciencias_contabeis", label: "Ciências Contábeis" },
    { value: "comunicacao", label: "Comunicação" },
    { value: "demografias", label: "Demografias" },
    { value: "direito", label: "Direito" },
    { value: "economia", label: "Economia" },
    { value: "planejamento_urbano", label: "Planejamento Urbano e Regional" },
    { value: "servico_social", label: "Serviço Social" },
    { value: "turismo", label: "Turismo" },
  ],
  ciencias_humanas: [
    { value: "antropologia", label: "Antropologia" },
    { value: "arqueologia", label: "Arqueologia" },
    { value: "ciencia_politica", label: "Ciência Política" },
    { value: "educacao", label: "Educação" },
    { value: "filosofia", label: "Filosofia" },
    { value: "geografia", label: "Geografia" },
    { value: "historia", label: "História" },
    { value: "psicologia", label: "Psicologia" },
    { value: "sociologia", label: "Sociologia" },
    { value: "teologia", label: "Teologia" },
  ],
  linguistica_letras_artes: [
    { value: "artes", label: "Artes" },
    { value: "letras", label: "Letras" },
    { value: "linguistica", label: "Linguística" },
    { value: "musica", label: "Música" },
  ],
  multidisciplinar: [
    { value: "biotecnologia", label: "Biotecnologia" },
    { value: "ciencias_ambientais", label: "Ciências Ambientais" },
    { value: "ensino", label: "Ensino" },
    { value: "interdisciplinar", label: "Interdisciplinar" },
    { value: "materiais", label: "Materiais" },
  ],
};

export interface Edital {
  id: string;
  programa_nome: string;
  ies_nome: string;
  ies_sigla: string;
  grande_area: GrandeArea;
  area_especifica: string;
  micro_area: string; // valor exato de MICRO_AREAS[grande_area][*].value
  nivel: Nivel;
  estado: UF;
  cidade: string;
  modalidade: "presencial" | "ead" | "hibrido";
  vagas: number;
  prazo_inscricao: string; // ISO date
  data_inicio_aulas?: string;
  link_edital: string;
  bolsas_disponiveis: boolean;
  fonte: "capes" | "dou" | "ies" | "internacional";
  internacional?: boolean;
  pais_destino?: string;
  score?: number;
}

export interface UserPreferences {
  grandes_areas: GrandeArea[];
  micro_areas: string[];
  estados: UF[];
  niveis: Nivel[];
  aceita_ead: boolean;
  paises: string[];       // regiões internacionais: "europa" | "america_norte" | "japao" | "china" | "outros"
  quer_brasil: boolean;   // true = inclui editais nacionais
}

export const GRANDES_AREAS: { value: GrandeArea; label: string; emoji: string }[] = [
  { value: "ciencias_exatas", label: "Ciências Exatas e da Terra", emoji: "🔭" },
  { value: "ciencias_biologicas", label: "Ciências Biológicas", emoji: "🧬" },
  { value: "engenharias", label: "Engenharias", emoji: "⚙️" },
  { value: "ciencias_saude", label: "Ciências da Saúde", emoji: "🏥" },
  { value: "ciencias_agrarias", label: "Ciências Agrárias", emoji: "🌱" },
  { value: "ciencias_sociais_aplicadas", label: "Ciências Sociais Aplicadas", emoji: "📊" },
  { value: "ciencias_humanas", label: "Ciências Humanas", emoji: "📚" },
  { value: "linguistica_letras_artes", label: "Linguística, Letras e Artes", emoji: "🎭" },
  { value: "multidisciplinar", label: "Multidisciplinar", emoji: "🔀" },
];

export const ESTADOS: { value: UF; label: string }[] = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AM", label: "Amazonas" },
  { value: "AP", label: "Amapá" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MG", label: "Minas Gerais" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MT", label: "Mato Grosso" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "PR", label: "Paraná" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SE", label: "Sergipe" },
  { value: "SP", label: "São Paulo" },
  { value: "TO", label: "Tocantins" },
];

export const MOCK_EDITAIS: Edital[] = [
  {
    id: "edital-001",
    programa_nome: "Programa de Pós-Graduação em Ciência da Computação",
    ies_nome: "Universidade de São Paulo",
    ies_sigla: "USP",
    grande_area: "ciencias_exatas",
    area_especifica: "Ciência da Computação",
    micro_area: "ciencia_computacao",
    nivel: "mestrado",
    estado: "SP",
    cidade: "São Paulo",
    modalidade: "presencial",
    vagas: 20,
    prazo_inscricao: "2026-04-30",
    link_edital: "https://prpg.usp.br",
    bolsas_disponiveis: true,
    fonte: "capes",
  },
  {
    id: "edital-002",
    programa_nome: "Programa de Pós-Graduação em Administração",
    ies_nome: "Fundação Getulio Vargas",
    ies_sigla: "FGV",
    grande_area: "ciencias_sociais_aplicadas",
    area_especifica: "Administração",
    micro_area: "administracao",
    nivel: "mestrado_profissional",
    estado: "SP",
    cidade: "São Paulo",
    modalidade: "presencial",
    vagas: 30,
    prazo_inscricao: "2026-05-15",
    link_edital: "https://www.fgv.br",
    bolsas_disponiveis: false,
    fonte: "ies",
  },
  {
    id: "edital-003",
    programa_nome: "Programa de Pós-Graduação em Medicina",
    ies_nome: "Universidade Federal de Minas Gerais",
    ies_sigla: "UFMG",
    grande_area: "ciencias_saude",
    area_especifica: "Medicina",
    micro_area: "medicina",
    nivel: "doutorado",
    estado: "MG",
    cidade: "Belo Horizonte",
    modalidade: "presencial",
    vagas: 15,
    prazo_inscricao: "2026-04-10",
    link_edital: "https://www.medicina.ufmg.br",
    bolsas_disponiveis: true,
    fonte: "capes",
  },
  {
    id: "edital-004",
    programa_nome: "Programa de Pós-Graduação em Direito",
    ies_nome: "Universidade Federal do Rio de Janeiro",
    ies_sigla: "UFRJ",
    grande_area: "ciencias_sociais_aplicadas",
    area_especifica: "Direito",
    micro_area: "direito",
    nivel: "mestrado",
    estado: "RJ",
    cidade: "Rio de Janeiro",
    modalidade: "presencial",
    vagas: 25,
    prazo_inscricao: "2026-05-20",
    link_edital: "https://www.ufrj.br",
    bolsas_disponiveis: true,
    fonte: "dou",
  },
  {
    id: "edital-005",
    programa_nome: "Programa de Pós-Graduação em Educação",
    ies_nome: "Universidade Estadual de Campinas",
    ies_sigla: "UNICAMP",
    grande_area: "ciencias_humanas",
    area_especifica: "Educação",
    micro_area: "educacao",
    nivel: "doutorado",
    estado: "SP",
    cidade: "Campinas",
    modalidade: "presencial",
    vagas: 18,
    prazo_inscricao: "2026-06-01",
    link_edital: "https://www.prg.unicamp.br",
    bolsas_disponiveis: true,
    fonte: "capes",
  },
  {
    id: "edital-006",
    programa_nome: "Programa de Pós-Graduação em Engenharia Elétrica",
    ies_nome: "Universidade Federal do Rio Grande do Sul",
    ies_sigla: "UFRGS",
    grande_area: "engenharias",
    area_especifica: "Engenharia Elétrica",
    micro_area: "eng_eletrica",
    nivel: "mestrado",
    estado: "RS",
    cidade: "Porto Alegre",
    modalidade: "presencial",
    vagas: 22,
    prazo_inscricao: "2026-04-25",
    link_edital: "https://www.ufrgs.br/ppgee",
    bolsas_disponiveis: true,
    fonte: "capes",
  },
  {
    id: "edital-007",
    programa_nome: "Programa de Pós-Graduação em Psicologia",
    ies_nome: "Pontifícia Universidade Católica de São Paulo",
    ies_sigla: "PUC-SP",
    grande_area: "ciencias_humanas",
    area_especifica: "Psicologia",
    micro_area: "psicologia",
    nivel: "mestrado",
    estado: "SP",
    cidade: "São Paulo",
    modalidade: "presencial",
    vagas: 12,
    prazo_inscricao: "2026-05-05",
    link_edital: "https://www.pucsp.br",
    bolsas_disponiveis: false,
    fonte: "ies",
  },
  {
    id: "edital-008",
    programa_nome: "Programa de Pós-Graduação em Agronomia",
    ies_nome: "Universidade Federal de Lavras",
    ies_sigla: "UFLA",
    grande_area: "ciencias_agrarias",
    area_especifica: "Agronomia",
    micro_area: "agronomia",
    nivel: "doutorado",
    estado: "MG",
    cidade: "Lavras",
    modalidade: "presencial",
    vagas: 10,
    prazo_inscricao: "2026-04-15",
    link_edital: "https://prg.ufla.br",
    bolsas_disponiveis: true,
    fonte: "capes",
  },
  {
    id: "edital-009",
    programa_nome: "Programa de Pós-Graduação em Letras",
    ies_nome: "Universidade Federal do Paraná",
    ies_sigla: "UFPR",
    grande_area: "linguistica_letras_artes",
    area_especifica: "Letras",
    micro_area: "letras",
    nivel: "mestrado",
    estado: "PR",
    cidade: "Curitiba",
    modalidade: "presencial",
    vagas: 20,
    prazo_inscricao: "2026-05-30",
    link_edital: "https://www.ufpr.br/portalufpr",
    bolsas_disponiveis: true,
    fonte: "dou",
  },
  {
    id: "edital-010",
    programa_nome: "Programa de Pós-Graduação em Saúde Pública",
    ies_nome: "Universidade Federal da Bahia",
    ies_sigla: "UFBA",
    grande_area: "ciencias_saude",
    area_especifica: "Saúde Pública",
    micro_area: "saude_coletiva",
    nivel: "mestrado_profissional",
    estado: "BA",
    cidade: "Salvador",
    modalidade: "ead",
    vagas: 40,
    prazo_inscricao: "2026-06-10",
    link_edital: "https://posgraduacao.ufba.br",
    bolsas_disponiveis: false,
    fonte: "capes",
  },
  // --- Internacionais ---
  {
    id: "intl_001",
    programa_nome: "PDSE 2026 — Doutorado Sanduíche no Exterior (CAPES)",
    ies_nome: "CAPES — Coordenação de Aperfeiçoamento de Pessoal de Nível Superior",
    ies_sigla: "CAPES",
    grande_area: "multidisciplinar",
    area_especifica: "Todas as áreas",
    micro_area: "interdisciplinar",
    nivel: "doutorado",
    estado: "DF",
    cidade: "Brasília",
    modalidade: "presencial",
    vagas: 500,
    prazo_inscricao: "2026-07-15",
    link_edital: "https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/bolsas/pdse",
    bolsas_disponiveis: true,
    fonte: "internacional",
    internacional: true,
    pais_destino: "Exterior (qualquer país)",
  },
  {
    id: "intl_002",
    programa_nome: "Fulbright Brasil — Mestrado e Doutorado nos EUA 2026/2027",
    ies_nome: "Comissão Fulbright Brasil",
    ies_sigla: "Fulbright",
    grande_area: "multidisciplinar",
    area_especifica: "Todas as áreas",
    micro_area: "interdisciplinar",
    nivel: "mestrado",
    estado: "DF",
    cidade: "Brasília",
    modalidade: "presencial",
    vagas: 100,
    prazo_inscricao: "2026-09-30",
    link_edital: "https://fulbright.org.br/programas/bolsas-para-brasileiros/",
    bolsas_disponiveis: true,
    fonte: "internacional",
    internacional: true,
    pais_destino: "🇺🇸 Estados Unidos",
  },
  {
    id: "intl_003",
    programa_nome: "DAAD — Bolsas de Pós-Graduação e Pesquisa na Alemanha 2026",
    ies_nome: "DAAD — Serviço Alemão de Intercâmbio Acadêmico",
    ies_sigla: "DAAD",
    grande_area: "engenharias",
    area_especifica: "Engenharia e Ciências Aplicadas",
    micro_area: "engenharia_eletrica",
    nivel: "doutorado",
    estado: "DF",
    cidade: "Brasília",
    modalidade: "presencial",
    vagas: 80,
    prazo_inscricao: "2026-10-31",
    link_edital: "https://www.daad.de/pt/para-quem-estuda-e-pesquisa-no-exterior/bolsas-de-estudo/",
    bolsas_disponiveis: true,
    fonte: "internacional",
    internacional: true,
    pais_destino: "🇩🇪 Alemanha",
  },
  {
    id: "intl_004",
    programa_nome: "CNPq — Bolsas de Pós-Doutorado no Exterior 2026",
    ies_nome: "CNPq — Conselho Nacional de Desenvolvimento Científico e Tecnológico",
    ies_sigla: "CNPq",
    grande_area: "multidisciplinar",
    area_especifica: "Todas as áreas",
    micro_area: "interdisciplinar",
    nivel: "pos_doutorado",
    estado: "DF",
    cidade: "Brasília",
    modalidade: "presencial",
    vagas: 200,
    prazo_inscricao: "2026-08-20",
    link_edital: "https://www.gov.br/cnpq/pt-br/oportunidades",
    bolsas_disponiveis: true,
    fonte: "internacional",
    internacional: true,
    pais_destino: "Exterior (qualquer país)",
  },
  {
    id: "intl_005",
    programa_nome: "Australia Awards — Bolsas para Pós-Graduação na Austrália 2027",
    ies_nome: "Departamento de Relações Exteriores da Austrália",
    ies_sigla: "AusAwards",
    grande_area: "ciencias_saude",
    area_especifica: "Saúde Pública e Meio Ambiente",
    micro_area: "saude_coletiva",
    nivel: "mestrado",
    estado: "DF",
    cidade: "Brasília",
    modalidade: "presencial",
    vagas: 30,
    prazo_inscricao: "2026-06-30",
    link_edital: "https://www.australiaawards.gov.au",
    bolsas_disponiveis: true,
    fonte: "internacional",
    internacional: true,
    pais_destino: "🇦🇺 Austrália",
  },
];

export function calcularDiasRestantes(prazo: string): number {
  const hoje = new Date();
  const dataPrazo = new Date(prazo);
  const diff = dataPrazo.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calcularScore(edital: Edital, prefs: UserPreferences): number {
  let score = 0;

  // --- CRITÉRIOS ELIMINATÓRIOS ---
  // Grande área: se selecionou, o edital DEVE pertencer a uma delas
  if (prefs.grandes_areas.length > 0 && !prefs.grandes_areas.includes(edital.grande_area)) {
    return 0;
  }
  // Micro área: se selecionou micro áreas dentro da grande área, o edital DEVE bater exatamente
  if (prefs.micro_areas.length > 0 && !prefs.micro_areas.includes(edital.micro_area)) {
    return 0;
  }
  const isInternacional = !!(edital as any).internacional;

  // Internacional: elimina se usuário não quer exterior
  if (isInternacional && prefs.paises.length === 0) return 0;

  // Internacional: filtra por região se usuário especificou
  if (isInternacional && prefs.paises.length > 0 && !prefs.paises.includes("outros")) {
    const pd = ((edital as any).pais_destino || "").toLowerCase();
    const fonte = (edital.fonte || "").toLowerCase();
    const PAISES_EUROPA = ["italia","espanha","irlanda","alemanha","franca","portugal","franca","austria","belgica","holanda","suecia","noruega","dinamarca","finlandia","suica","poloni","europ"];
    const isEuropa = fonte === "euraxess" || PAISES_EUROPA.some((p) => pd.includes(p));
    const match =
      (prefs.paises.includes("europa") && isEuropa) ||
      (prefs.paises.includes("japao") && pd.includes("jap")) ||
      (prefs.paises.includes("china") && pd.includes("chin")) ||
      (prefs.paises.includes("america_norte") && (pd.includes("estados unidos") || pd.includes("eua") || pd.includes("canad")));
    if (!match) return 0;
  }

  // Brasil: elimina editais nacionais se usuário só quer exterior
  if (!isInternacional && !prefs.quer_brasil) return 0;

  // Estado: se selecionou estados, o edital DEVE ser daquele estado
  if (
    !isInternacional &&
    prefs.estados.length > 0 &&
    !prefs.estados.includes(edital.estado) &&
    !(edital.modalidade === "ead" && prefs.aceita_ead)
  ) {
    return 0;
  }
  // Nível: se selecionou níveis, o edital DEVE bater
  if (prefs.niveis.length > 0 && !prefs.niveis.includes(edital.nivel)) {
    return 0;
  }

  // --- PONTUAÇÃO DE RELEVÂNCIA ---
  if (prefs.grandes_areas.length > 0) {
    // Micro área bate exatamente: 40 pts. Grande área sem micro: 30 pts.
    score += prefs.micro_areas.includes(edital.micro_area) ? 40 : 30;
  }
  if (prefs.estados.length === 0 || prefs.estados.includes(edital.estado)) score += 30;
  if (prefs.niveis.length > 0 && prefs.niveis.includes(edital.nivel)) score += 20;
  if (edital.modalidade === "presencial" || prefs.aceita_ead) score += 10;

  return score;
}

export function filtrarEditais(prefs: UserPreferences): Edital[] {
  return MOCK_EDITAIS
    .filter((e) => calcularDiasRestantes(e.prazo_inscricao) > 0)
    .map((e) => ({ ...e, score: calcularScore(e, prefs) }))
    .filter((e) => (e.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export const NIVEL_LABELS: Record<Nivel, string> = {
  mestrado: "Mestrado",
  mestrado_profissional: "Mestrado Profissional",
  doutorado: "Doutorado",
  pos_doutorado: "Pós-Doutorado",
};

export const GRANDE_AREA_LABELS: Record<GrandeArea, string> = {
  ciencias_exatas: "Ciências Exatas",
  ciencias_biologicas: "Ciências Biológicas",
  engenharias: "Engenharias",
  ciencias_saude: "Ciências da Saúde",
  ciencias_agrarias: "Ciências Agrárias",
  ciencias_sociais_aplicadas: "Ciências Sociais Aplicadas",
  ciencias_humanas: "Ciências Humanas",
  linguistica_letras_artes: "Linguística, Letras e Artes",
  multidisciplinar: "Multidisciplinar",
};
