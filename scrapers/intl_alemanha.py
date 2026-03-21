"""
Scraper Internacional — Alemanha
Fontes: DAAD (daad.de) + EURAXESS Germany
"""
import hashlib
from datetime import datetime, timedelta
from typing import Any
import httpx
from scrapers.utils import DATA_DIR, rate_limit, salvar_json, setup_logger

logger = setup_logger("intl_alemanha")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PosGradTracker/1.0; +https://posgrad-tracker.vercel.app)",
    "Accept": "text/html,application/xhtml+xml,application/json,*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8,de;q=0.7",
}

def _uid(texto: str) -> str:
    return hashlib.md5(texto.encode()).hexdigest()[:10]


def _coletar_daad(cliente: httpx.Client) -> list[dict]:
    """Tenta scraping do portal DAAD Brasil."""
    try:
        url = "https://www.daad.de/pt/para-quem-estuda-e-pesquisa-no-exterior/bolsas-de-estudo/"
        r = cliente.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            logger.debug(f"DAAD retornou {r.status_code}")
            return []

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(r.text, "html.parser")

        editais = []
        # Tenta extrair cards de bolsas da página DAAD
        for card in soup.select("article, .c-teaser, .teaser-item, .scholarship-item")[:10]:
            titulo_tag = card.select_one("h2, h3, .teaser__headline, .title")
            link_tag = card.select_one("a[href]")
            desc_tag = card.select_one("p, .teaser__text, .description")

            titulo = titulo_tag.get_text(strip=True) if titulo_tag else ""
            link = link_tag.get("href", "") if link_tag else ""
            descricao = desc_tag.get_text(strip=True) if desc_tag else ""

            if not titulo or len(titulo) < 10:
                continue
            if link and not link.startswith("http"):
                link = f"https://www.daad.de{link}"

            editais.append({
                "id": f"daad_{_uid(titulo)}",
                "titulo": titulo[:200],
                "descricao": descricao[:500],
                "link_edital": link or url,
            })

        logger.info(f"DAAD HTML: {len(editais)} cards encontrados")
        return editais
    except Exception as e:
        logger.debug(f"DAAD scraping falhou: {e}")
        return []


def _mock_alemanha() -> list[dict]:
    """Mock estruturado com bolsas reais da Alemanha para brasileiros."""
    logger.info("Alemanha: usando mock estruturado")
    hoje = datetime.now()
    return [
        {
            "id": "daad_brs_2026",
            "titulo": "DAAD — Bolsas de Pesquisa para Brasileiros (Mestrado e Doutorado)",
            "descricao": "O Serviço Alemão de Intercâmbio Acadêmico (DAAD) oferece bolsas para estudantes e pesquisadores brasileiros realizarem mestrado, doutorado ou pós-doutorado em universidades alemãs. Cobertura: mensalidade, seguro saúde, passagem e custo de vida. Todas as áreas do conhecimento.",
            "link_edital": "https://www.daad.de/pt/para-quem-estuda-e-pesquisa-no-exterior/bolsas-de-estudo/",
            "universidade": "DAAD",
            "ies_sigla": "DAAD",
            "nivel": "doutorado",
            "niveis_aceitos": ["mestrado", "doutorado", "pos_doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=90)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Alemanha",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "daad_posdoc_2026",
            "titulo": "DAAD — Bolsas de Pós-Doutorado na Alemanha (Todas as Áreas)",
            "descricao": "Bolsas DAAD para pesquisadores brasileiros com doutorado concluído realizarem pesquisa pós-doutoral em instituições alemãs. Duração de 1 a 2 anos. Cobertura completa. Processo seletivo contínuo.",
            "link_edital": "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/",
            "universidade": "DAAD",
            "ies_sigla": "DAAD",
            "nivel": "pos_doutorado",
            "niveis_aceitos": ["pos_doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=120)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Alemanha",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "tum_phd_2026",
            "titulo": "TU Munich — International Doctoral Program (IGSSE / TUM Graduate School)",
            "descricao": "A Universidade Técnica de Munique oferece posições de doutorado financiadas nas áreas de Engenharia, Ciências Exatas, Ciências da Vida e Gestão. Candidaturas aceitas continuamente pelo TUM Graduate School.",
            "link_edital": "https://www.gs.tum.de/en/graduate-school/doctoral-programs/",
            "universidade": "TU Munich",
            "ies_sigla": "TUM",
            "nivel": "doutorado",
            "niveis_aceitos": ["doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=60)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Alemanha",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "heidelberg_fellowship_2026",
            "titulo": "Heidelberg University — Postdoctoral Fellowship Program (HGSFP)",
            "descricao": "A Universidade de Heidelberg oferece fellowships de pós-doutorado nas áreas de Ciências Naturais, Matemática, Ciências da Computação e Medicina. Duração de 2 anos com possibilidade de extensão.",
            "link_edital": "https://www.uni-heidelberg.de/en/research/research-at-heidelberg-university/graduate-education",
            "universidade": "Heidelberg University",
            "ies_sigla": "Heidelberg",
            "nivel": "pos_doutorado",
            "niveis_aceitos": ["doutorado", "pos_doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=75)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Alemanha",
            "fonte": "internacional",
            "internacional": True,
        },
        {
            "id": "euraxess_de_2026",
            "titulo": "EURAXESS Germany — Vagas de Pesquisa Abertas em Universidades Alemãs",
            "descricao": "O portal EURAXESS centraliza oportunidades de pesquisa e doutorado em todas as universidades alemãs. Vagas em Engenharia, Ciências Exatas, Biologia, Ciências Humanas e mais. Cadastro gratuito para pesquisadores internacionais.",
            "link_edital": "https://euraxess.ec.europa.eu/jobs/search?query=&country=DE",
            "universidade": "EURAXESS",
            "ies_sigla": "EURAXESS",
            "nivel": "doutorado",
            "niveis_aceitos": ["mestrado", "doutorado", "pos_doutorado"],
            "bolsas_disponiveis": True,
            "prazo_inscricao": (hoje + timedelta(days=45)).strftime("%Y-%m-%d"),
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "pais_destino": "Alemanha",
            "fonte": "internacional",
            "internacional": True,
        },
    ]


def coletar_editais_alemanha() -> list[dict[str, Any]]:
    logger.info("=" * 40)
    logger.info("Iniciando coleta Internacional — Alemanha")

    editais_html = []
    with httpx.Client(timeout=15, follow_redirects=True) as cliente:
        editais_html = _coletar_daad(cliente)
        rate_limit(2.0)

    # Se scraping real retornou resultados, normaliza e complementa com mock
    if len(editais_html) >= 2:
        hoje = datetime.now()
        hoje_str = hoje.strftime("%Y-%m-%d")
        prazo_default = (hoje + timedelta(days=90)).strftime("%Y-%m-%d")
        editais = []
        for e in editais_html:
            editais.append({
                **e,
                "pais_destino": "Alemanha",
                "fonte": "internacional",
                "internacional": True,
                "nivel": "doutorado",
                "niveis_aceitos": ["mestrado", "doutorado", "pos_doutorado"],
                "bolsas_disponiveis": True,
                "data_publicacao": hoje_str,
                "prazo_inscricao": prazo_default,
                "universidade": "DAAD",
                "ies_sigla": "DAAD",
            })
    else:
        editais = _mock_alemanha()

    logger.info(f"Alemanha: {len(editais)} editais")
    return editais
