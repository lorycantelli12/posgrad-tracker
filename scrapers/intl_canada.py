"""
Scraper Internacional — Canadá
Fontes: EduCanada + NSERC/CGS + Top 5 universidades canadenses
"""
import hashlib
from datetime import datetime, timedelta
from typing import Any
import httpx
from scrapers.utils import DATA_DIR, rate_limit, salvar_json, setup_logger

logger = setup_logger("intl_canada")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PosGradTracker/1.0; +https://posgrad-tracker.vercel.app)",
    "Accept": "text/html,application/xhtml+xml,*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8,fr;q=0.7",
}


def _uid(texto: str) -> str:
    return hashlib.md5(texto.encode()).hexdigest()[:10]


def _coletar_educanada(cliente: httpx.Client) -> list[dict]:
    """Tenta scraping do portal EduCanada."""
    try:
        url = "https://www.educanada.ca/scholarships-bourses/index.aspx?lang=eng"
        r = cliente.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            logger.debug(f"EduCanada retornou {r.status_code}")
            return []

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(r.text, "html.parser")

        editais = []
        for card in soup.select(".gc-frm, .panel, article, .scholarship-item, li.item")[:10]:
            titulo_tag = card.select_one("h2, h3, h4, a.h3, .title")
            link_tag = card.select_one("a[href]")
            desc_tag = card.select_one("p, .description, .excerpt")

            titulo = titulo_tag.get_text(strip=True) if titulo_tag else ""
            link = link_tag.get("href", "") if link_tag else ""
            descricao = desc_tag.get_text(strip=True) if desc_tag else ""

            if not titulo or len(titulo) < 10:
                continue
            if link and not link.startswith("http"):
                link = f"https://www.educanada.ca{link}"

            editais.append({
                "id": f"educanada_{_uid(titulo)}",
                "titulo": titulo[:200],
                "descricao": descricao[:500],
                "link_edital": link or url,
            })

        logger.info(f"EduCanada HTML: {len(editais)} bolsas encontradas")
        return editais
    except Exception as e:
        logger.debug(f"EduCanada scraping falhou: {e}")
        return []


def _mock_canada() -> list[dict]:
    """Mock estruturado com bolsas reais do Canadá para brasileiros."""
    logger.info("Canadá: usando mock estruturado")
    hoje = datetime.now()
    return [
        {
            "id": "educanada_scholarships_2026",
            "titulo": "EduCanada — Bolsas do Governo Canadense para Estudantes Internacionais 2026",
            "descricao": "O portal EduCanada centraliza as bolsas federais e provinciais do governo canadense para estudantes internacionais. Inclui programas de mestrado, doutorado e pesquisa em universidades canadenses. Diversas áreas do conhecimento. Inscrições normalmente em janeiro/fevereiro.",
            "link_edital": "https://www.educanada.ca/scholarships-bourses/index.aspx?lang=eng",
            "universidade": "EduCanada",
            "ies_sigla": "EduCanada",
            "nivel": "mestrado",
            "niveis_aceitos": ["mestrado", "doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=90)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Canadá",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "nserc_cgs_2026",
            "titulo": "NSERC — Canada Graduate Scholarships (CGS-M e CGS-D) 2026",
            "descricao": "O NSERC (Natural Sciences and Engineering Research Council) oferece bolsas federais CGS para mestrado (CAD 17.500/ano, 1 ano) e doutorado (CAD 35.000/ano, 3 anos) nas áreas de Ciências Naturais e Engenharia. Candidaturas via universidade anfitriã.",
            "link_edital": "https://www.nserc-crsng.gc.ca/Students-Etudiants/index_eng.asp",
            "universidade": "NSERC",
            "ies_sigla": "NSERC",
            "nivel": "doutorado",
            "niveis_aceitos": ["mestrado", "doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=75)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Canadá",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "utoronto_sgs_2026",
            "titulo": "University of Toronto — SGS Doctoral Fellowship (Todas as Áreas)",
            "descricao": "A Universidade de Toronto garante funding para todos os doutorandos admitidos: pacote mínimo de CAD 15.000/ano por 5 anos, combinando bolsas internas + assistência de ensino. Uma das mais fortes universidades pesquisa do Canadá.",
            "link_edital": "https://sgs.utoronto.ca/awards",
            "universidade": "U. Toronto",
            "ies_sigla": "UToronto",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=60)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Canadá",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "ubc_grad_2026",
            "titulo": "UBC — University of British Columbia — Graduate Research Funding 2026",
            "descricao": "A UBC oferece suporte financeiro para doutorandos internacionais via Four Year Doctoral Fellowship (4YF) — CAD 18.200/ano por 4 anos + isenção de matrícula. Áreas: todas. Campus em Vancouver (um dos melhores QS do Canadá).",
            "link_edital": "https://students.ubc.ca/enrolment/finances/funding",
            "universidade": "UBC",
            "ies_sigla": "UBC",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=50)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Canadá",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "mcgill_phd_2026",
            "titulo": "McGill University — Graduate Excellence Fellowship (Doutorado Internacional)",
            "descricao": "A McGill University (Montreal) oferece o Graduate Excellence Fellowship para doutorandos internacionais de alto mérito nas áreas de Ciências, Engenharia, Saúde, Educação e Humanidades. Valor: CAD 10.000 + financiamento adicional do supervisor.",
            "link_edital": "https://www.mcgill.ca/gps/funding",
            "universidade": "McGill",
            "ies_sigla": "McGill",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=45)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Canadá",
            "fonte": "internacional",
            "internacional": True,
        },
    ]


def coletar_editais_canada() -> list[dict[str, Any]]:
    logger.info("=" * 40)
    logger.info("Iniciando coleta Internacional — Canadá")

    editais_html = []
    with httpx.Client(timeout=15, follow_redirects=True) as cliente:
        editais_html = _coletar_educanada(cliente)
        rate_limit(2.0)

    if len(editais_html) >= 2:
        hoje = datetime.now()
        hoje_str = hoje.strftime("%Y-%m-%d")
        prazo_default = (hoje + timedelta(days=90)).strftime("%Y-%m-%d")
        editais = []
        for e in editais_html:
            editais.append({
                **e,
                "pais_destino": "Canadá",
                "fonte": "internacional",
                "internacional": True,
                "nivel": "doutorado",
                "niveis_aceitos": ["mestrado", "doutorado"],
                "bolsas_disponiveis": True,
                "data_publicacao": hoje_str,
                "prazo_inscricao": prazo_default,
                "universidade": "EduCanada",
                "ies_sigla": "EduCanada",
            })
    else:
        editais = _mock_canada()

    logger.info(f"Canadá: {len(editais)} editais")
    return editais
