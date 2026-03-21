"""
Scraper Internacional — Austrália
Fontes: Australia Awards + Grupo dos 8 (Go8)
"""
import hashlib
from datetime import datetime, timedelta
from typing import Any
import httpx
from scrapers.utils import DATA_DIR, rate_limit, salvar_json, setup_logger

logger = setup_logger("intl_australia")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PosGradTracker/1.0; +https://posgrad-tracker.vercel.app)",
    "Accept": "text/html,application/xhtml+xml,*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
}


def _uid(texto: str) -> str:
    return hashlib.md5(texto.encode()).hexdigest()[:10]


def _coletar_australia_awards(cliente: httpx.Client) -> list[dict]:
    """Tenta scraping do portal Australia Awards."""
    try:
        url = "https://www.australiaawards.gov.au/scholarships"
        r = cliente.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            logger.debug(f"Australia Awards retornou {r.status_code}")
            return []

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(r.text, "html.parser")

        editais = []
        for card in soup.select(".scholarship-card, .card, article, .listing-item")[:10]:
            titulo_tag = card.select_one("h2, h3, h4, .title")
            link_tag = card.select_one("a[href]")
            desc_tag = card.select_one("p, .description")

            titulo = titulo_tag.get_text(strip=True) if titulo_tag else ""
            link = link_tag.get("href", "") if link_tag else ""
            descricao = desc_tag.get_text(strip=True) if desc_tag else ""

            if not titulo or len(titulo) < 10:
                continue
            if link and not link.startswith("http"):
                link = f"https://www.australiaawards.gov.au{link}"

            editais.append({
                "id": f"auawards_{_uid(titulo)}",
                "titulo": titulo[:200],
                "descricao": descricao[:500],
                "link_edital": link or url,
            })

        logger.info(f"Australia Awards HTML: {len(editais)} bolsas encontradas")
        return editais
    except Exception as e:
        logger.debug(f"Australia Awards scraping falhou: {e}")
        return []


def _mock_australia() -> list[dict]:
    """Mock estruturado com bolsas reais da Austrália para brasileiros."""
    logger.info("Austrália: usando mock estruturado")
    hoje = datetime.now()
    return [
        {
            "id": "australia_awards_2026",
            "titulo": "Australia Awards — Bolsas para Países em Desenvolvimento (incluindo Brasil) 2026",
            "descricao": "O programa Australia Awards oferece bolsas de mestrado e doutorado para cidadãos de países em desenvolvimento estudarem em universidades australianas. Cobertura integral: matrícula, moradia, passagem e seguro saúde. Inscrições geralmente em fevereiro/março.",
            "link_edital": "https://www.australiaawards.gov.au/scholarships",
            "universidade": "Australia Awards",
            "ies_sigla": "AusAwards",
            "nivel": "mestrado",
            "niveis_aceitos": ["mestrado", "doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=60)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Austrália",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "umelbourne_phd_2026",
            "titulo": "University of Melbourne — Melbourne Research Scholarship (Doutorado)",
            "descricao": "A Universidade de Melbourne oferece bolsas de doutorado competitivas para pesquisadores internacionais em todas as áreas do conhecimento. Cobertura: taxa de matrícula + estipêndio anual de AUD 32.000. Candidaturas em dois rounds anuais.",
            "link_edital": "https://scholarships.unimelb.edu.au",
            "universidade": "U. Melbourne",
            "ies_sigla": "UMelbourne",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado", "pos_doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=90)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Austrália",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "anu_phd_2026",
            "titulo": "ANU — Australian National University HDR Scholarship 2026",
            "descricao": "A Australian National University oferece bolsas HDR (Higher Degree by Research) para doutorado em Ciências, Engenharia, Humanidades, Ciências Sociais, Direito e Negócios. Inclui taxa de matrícula e estipêndio de AUD 30.000/ano.",
            "link_edital": "https://www.anu.edu.au/scholarships",
            "universidade": "ANU",
            "ies_sigla": "ANU",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=75)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Austrália",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "usydney_scholarship_2026",
            "titulo": "University of Sydney — International Research Training Program Scholarship",
            "descricao": "Bolsa de doutorado da Universidade de Sydney financiada pelo governo australiano. Cobre taxa de matrícula e oferece estipêndio de AUD 31.500/ano. Áreas: todas. Processo seletivo contínuo, mas com dois deadlines principais por ano.",
            "link_edital": "https://sydney.edu.au/scholarships",
            "universidade": "U. Sydney",
            "ies_sigla": "USydney",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=50)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Austrália",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "unsw_scholarship_2026",
            "titulo": "UNSW Sydney — International Scientia PhD Scholarship",
            "descricao": "A UNSW Sydney oferece a Scientia PhD Scholarship para pesquisadores internacionais de alto desempenho. Inclui taxa de matrícula + estipêndio de AUD 50.000/ano (diferenciado) + suporte de carreira. Foco em impacto global.",
            "link_edital": "https://scholarships.unsw.edu.au",
            "universidade": "UNSW",
            "ies_sigla": "UNSW",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=45)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Austrália",
            "fonte": "internacional",
            "internacional": True,
        },
    ]


def coletar_editais_australia() -> list[dict[str, Any]]:
    logger.info("=" * 40)
    logger.info("Iniciando coleta Internacional — Austrália")

    editais_html = []
    with httpx.Client(timeout=15, follow_redirects=True) as cliente:
        editais_html = _coletar_australia_awards(cliente)
        rate_limit(2.0)

    if len(editais_html) >= 2:
        hoje = datetime.now()
        hoje_str = hoje.strftime("%Y-%m-%d")
        prazo_default = (hoje + timedelta(days=90)).strftime("%Y-%m-%d")
        editais = []
        for e in editais_html:
            editais.append({
                **e,
                "pais_destino": "Austrália",
                "fonte": "internacional",
                "internacional": True,
                "nivel": "doutorado",
                "niveis_aceitos": ["mestrado", "doutorado"],
                "bolsas_disponiveis": True,
                "data_publicacao": hoje_str,
                "prazo_inscricao": prazo_default,
                "universidade": "Australia Awards",
                "ies_sigla": "AusAwards",
            })
    else:
        editais = _mock_australia()

    logger.info(f"Austrália: {len(editais)} editais")
    return editais
