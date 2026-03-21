/**
 * Dados visuais das principais IES brasileiras.
 * logo_url: gerado via Google/gstatic favicon service (confiável, 256px)
 * cor: cor institucional primária (usado como fallback)
 */
export interface IESData {
  cor: string;
  site?: string;
  logo_url?: string;
}

/** Gera a URL do favicon via Google (256px, B&W via CSS) */
export function faviconUrl(domain: string): string {
  return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=256`;
}

export const IES_DATA: Record<string, IESData> = {
  USP:       { cor: "#0C2D6E", site: "usp.br" },
  UNICAMP:   { cor: "#1B3A75", site: "unicamp.br" },
  UFMG:     { cor: "#003174", site: "ufmg.br" },
  UFRJ:     { cor: "#004A99", site: "ufrj.br" },
  UFRGS:    { cor: "#1F4591", site: "ufrgs.br" },
  UFBA:     { cor: "#005CA8", site: "ufba.br" },
  UFPR:     { cor: "#002147", site: "ufpr.br" },
  UFLA:     { cor: "#00603A", site: "ufla.br" },
  UFSC:     { cor: "#003F79", site: "ufsc.br" },
  UFC:      { cor: "#003087", site: "ufc.br" },
  UFPE:     { cor: "#004B87", site: "ufpe.br" },
  UNB:      { cor: "#004E8F", site: "unb.br" },
  UNESP:    { cor: "#0066CC", site: "unesp.br" },
  UFAM:     { cor: "#004A2F", site: "ufam.edu.br" },
  UFPA:     { cor: "#007A33", site: "ufpa.br" },
  UFMT:     { cor: "#004E8A", site: "ufmt.br" },
  UFMS:     { cor: "#002D62", site: "ufms.br" },
  UFG:      { cor: "#0033A0", site: "ufg.br" },
  UFES:     { cor: "#003087", site: "ufes.br" },
  UFJF:     { cor: "#004E8A", site: "ufjf.br" },
  UFV:      { cor: "#006633", site: "ufv.br" },
  UFOP:     { cor: "#003366", site: "ufop.br" },
  FGV:      { cor: "#003D7C", site: "fgv.br" },
  "PUC-SP": { cor: "#7B1E1E", site: "pucsp.br" },
};

/** Retorna os dados de uma IES pelo sigla com fallback de cor por hash */
export function getIESData(sigla: string): IESData {
  const data = IES_DATA[sigla];
  if (data) return data;

  const colors = ["#1a1a1a", "#374151", "#1e3a5f", "#1a3a2a", "#3a1a1a"];
  let hash = 0;
  for (let i = 0; i < sigla.length; i++) {
    hash = (hash + sigla.charCodeAt(i)) % colors.length;
  }
  return { cor: colors[hash] };
}

/** Lista das principais universidades públicas para a landing page */
export const UNIVERSIDADES_DESTAQUE = [
  { sigla: "USP",    nome: "Universidade de São Paulo" },
  { sigla: "UNICAMP",nome: "Universidade Estadual de Campinas" },
  { sigla: "UFMG",   nome: "Universidade Federal de Minas Gerais" },
  { sigla: "UFRJ",   nome: "Universidade Federal do Rio de Janeiro" },
  { sigla: "UFRGS",  nome: "Universidade Federal do Rio Grande do Sul" },
  { sigla: "UFBA",   nome: "Universidade Federal da Bahia" },
  { sigla: "UNB",    nome: "Universidade de Brasília" },
  { sigla: "UFPR",   nome: "Universidade Federal do Paraná" },
  { sigla: "UNESP",  nome: "Universidade Estadual Paulista" },
  { sigla: "UFSC",   nome: "Universidade Federal de Santa Catarina" },
  { sigla: "UFC",    nome: "Universidade Federal do Ceará" },
  { sigla: "UFPE",   nome: "Universidade Federal de Pernambuco" },
];
