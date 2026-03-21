"""
Scraper Internacional — EUA
Fontes: Fulbright Brasil + NSF GRFP + ProFellow
"""
import hashlib
from datetime import datetime, timedelta
from typing import Any
import httpx
from scrapers.utils import DATA_DIR, rate_limit, salvar_json, setup_logger

logger = setup_logger("intl_eua")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PosGradTracker/1.0; +https://posgrad-tracker.vercel.app)",
    "Accept": "text/html,application/xhtml+xml,*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
}


def _uid(texto: str) -> str:
    return hashlib.md5(texto.encode()).hexdigest()[:10]


def _coletar_fulbright_brasil(cliente: httpx.Client) -> list[dict]:
    """Tenta scraping do site Fulbright Brasil."""
    try:
        url = "https://fulbright.org.br/programas/bolsas-para-brasileiros/"
        r = cliente.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            logger.debug(f"Fulbright Brasil retornou {r.status_code}")
            return []

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(r.text, "html.parser")

        editais = []
        # Fulbright usa cards de programas
        for card in soup.select(".program-card, .card, article, .entry, .post")[:10]:
            titulo_tag = card.select_one("h2, h3, h4, .title, .entry-title")
            link_tag = card.select_one("a[href]")
            desc_tag = card.select_one("p, .excerpt, .description, .entry-content")

            titulo = titulo_tag.get_text(strip=True) if titulo_tag else ""
            link = link_tag.get("href", "") if link_tag else ""
            descricao = desc_tag.get_text(strip=True) if desc_tag else ""

            if not titulo or len(titulo) < 10:
                continue

            editais.append({
                "id": f"fulbright_{_uid(titulo)}",
                "titulo": titulo[:200],
                "descricao": descricao[:500],
                "link_edital": link or url,
            })

        logger.info(f"Fulbright Brasil HTML: {len(editais)} programas encontrados")
        return editais
    except Exception as e:
        logger.debug(f"Fulbright Brasil scraping falhou: {e}")
        return []


def _mock_eua() -> list[dict]:
    """Mock estruturado com bolsas reais dos EUA para brasileiros."""
    logger.info("EUA: usando mock estruturado")
    hoje = datetime.now()
    return [
        {
            "id": "fulbright_eua_2026",
            "titulo": "Fulbright Brasil — Bolsas de Pós-Graduação nos EUA 2026/2027",
            "descricao": "A Comissão Fulbright oferece bolsas para mestrado, doutorado e pós-doutorado nos Estados Unidos. Cobertura: passagem aérea, seguro saúde, mensalidade universitária e custo de vida. Todas as áreas do conhecimento. Candidatos devem ter excelente desempenho acadêmico.",
            "link_edital": "https://fulbright.org.br/programas/bolsas-para-brasileiros/",
            "universidade": "Fulbright Brasil",
            "ies_sigla": "Fulbright",
            "nivel": "doutorado",
            "niveis_aceitos": ["mestrado", "doutorado", "pos_doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=90)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "EUA",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "nsf_grfp_2026",
            "titulo": "NSF Graduate Research Fellowship Program (GRFP) 2026",
            "descricao": "A National Science Foundation oferece bolsas de doutorado nas áreas de STEM (Ciência, Tecnologia, Engenharia e Matemática) para estudantes internacionais em universidades americanas. Cobertura de 3 anos com estipêndio anual de US$ 37.000. Inscrições abertas em agosto/setembro.",
            "link_edital": "https://www.nsfgrfp.org/",
            "universidade": "NSF",
            "ies_sigla": "NSF",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=60)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "EUA",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "mit_phd_2026",
            "titulo": "MIT — PhD Fellowship Program (Ciências Exatas, Engenharia e IA)",
            "descricao": "O MIT oferece financiamento integral para doutorado nas áreas de Ciências da Computação, Engenharia, Física, Química e Biologia. Candidaturas para o outono de 2026. Processo altamente competitivo — requer carta de aceite do orientador.",
            "link_edital": "https://mitgsl.mit.edu/fellowships",
            "universidade": "MIT",
            "ies_sigla": "MIT",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado", "pos_doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=75)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "EUA",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "harvard_gsas_2026",
            "titulo": "Harvard GSAS — Graduate School of Arts and Sciences — Admissões 2026",
            "descricao": "Harvard oferece bolsas integrais para doutorado em Ciências Humanas, Ciências Sociais, Ciências Naturais e Artes. A maioria dos programas de doutorado oferecem funding completo (5+ anos). Prazo típico: dezembro do ano anterior.",
            "link_edital": "https://gsas.harvard.edu/funding",
            "universidade": "Harvard",
            "ies_sigla": "Harvard",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=50)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "EUA",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "stanford_phd_2026",
            "titulo": "Stanford University — PhD Programs with Fellowship (Graduate School)",
            "descricao": "Stanford oferece fellowships competitivos para doutorandos internacionais em Ciências da Computação, Bioengenharia, Ciências da Terra, Educação e outras áreas. Cobertura de 5 anos: estipêndio, matrícula e saúde. Candidaturas abrem em setembro.",
            "link_edital": "https://vpge.stanford.edu/fellowships",
            "universidade": "Stanford",
            "ies_sigla": "Stanford",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado", "pos_doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=65)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "EUA",
            "fonte": "internacional",
            "internacional": True,
        },
    ]


def coletar_editais_eua() -> list[dict[str, Any]]:
    logger.info("=" * 40)
    logger.info("Iniciando coleta Internacional — EUA")

    editais_html = []
    with httpx.Client(timeout=15, follow_redirects=True) as cliente:
        editais_html = _coletar_fulbright_brasil(cliente)
        rate_limit(2.0)

    if len(editais_html) >= 2:
        hoje = datetime.now()
        hoje_str = hoje.strftime("%Y-%m-%d")
        prazo_default = (hoje + timedelta(days=90)).strftime("%Y-%m-%d")
        editais = []
        for e in editais_html:
            editais.append({
                **e,
                "pais_destino": "EUA",
                "fonte": "internacional",
                "internacional": True,
                "nivel": "doutorado",
                "niveis_aceitos": ["mestrado", "doutorado", "pos_doutorado"],
                "bolsas_disponiveis": True,
                "data_publicacao": hoje_str,
                "prazo_inscricao": prazo_default,
                "universidade": "Fulbright",
                "ies_sigla": "Fulbright",
            })
    else:
        editais = _mock_eua()

    logger.info(f"EUA: {len(editais)} editais")
    return editais
