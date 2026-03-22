"""
Scraper Internacional — EURAXESS (portal oficial da Comissão Europeia)

Cobre: Itália, Espanha, Irlanda, Alemanha, França e outros países europeus.
Estratégia de 2 fases:
  1. Listing: coleta metadados + URL de detalhe de cada edital
  2. Detail: acessa cada página e extrai o link original ("More Information")

URL pattern:
  /jobs/search?f[0]=offer_type:funding&f[1]=country:{País}&page=N
"""

import hashlib
import time
from datetime import datetime
from typing import Any

import httpx
from bs4 import BeautifulSoup

from scrapers.utils import DATA_DIR, rate_limit, salvar_json, setup_logger

logger = setup_logger("intl_euraxess")

BASE_URL = "https://euraxess.ec.europa.eu"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PosGradTracker/1.0; +https://posgrad-tracker.vercel.app)",
    "Accept": "text/html,application/xhtml+xml,*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
}

# Países europeus disponíveis no filtro EURAXESS + nome PT-BR para o campo pais_destino
PAISES = {
    "Italy":   "italia",
    "Spain":   "espanha",
    "Ireland": "irlanda",
    "Germany": "alemanha",
    "France":  "franca",
    "Portugal":"portugal",
}


def _uid(url: str) -> str:
    return "euraxess_" + hashlib.md5(url.encode()).hexdigest()[:10]


def _listing_url(pais: str, page: int) -> str:
    return (
        f"{BASE_URL}/jobs/search"
        f"?f%5B0%5D=offer_type%3Afunding"
        f"&f%5B1%5D=country%3A{pais}"
        f"&page={page}"
    )


def _extrair_deadline(card_soup) -> str | None:
    """Extrai prazo de inscrição do card do listing."""
    # A estrutura HTML tem um ícone de calendário seguido do texto da data
    for li in card_soup.select("li, .field--name-field-application-deadline"):
        texto = li.get_text(strip=True)
        # Procura por padrão "D Month YYYY" ou "DD Month YYYY"
        import re
        m = re.search(r"(\d{1,2}\s+\w+\s+\d{4})", texto)
        if m:
            try:
                return datetime.strptime(m.group(1), "%d %B %Y").strftime("%Y-%m-%d")
            except ValueError:
                pass
    return None


def _scrape_listing(cliente: httpx.Client, pais_en: str, pais_pt: str, max_pages: int = 5) -> list[dict]:
    """
    Fase 1: coleta cards do listing EURAXESS para um país.
    Retorna lista com metadados básicos + url_detalhe (link interno EURAXESS).
    """
    resultados = []
    seen_urls: set[str] = set()

    for page in range(max_pages):
        url = _listing_url(pais_en, page)
        logger.debug(f"EURAXESS listing {pais_en} page {page}: {url}")

        try:
            r = cliente.get(url, headers=HEADERS, timeout=20)
            if r.status_code != 200:
                logger.warning(f"EURAXESS {pais_en} p{page}: HTTP {r.status_code}")
                break
        except Exception as e:
            logger.error(f"EURAXESS {pais_en} p{page} erro: {e}")
            break

        soup = BeautifulSoup(r.text, "html.parser")

        # Cards de resultado: cada <article> dentro da lista de resultados
        cards = soup.select("ul.search-results li article, .view-content article, article")
        if not cards:
            # Tenta seletor alternativo
            cards = soup.select("h3 a")

        novos = 0
        for card in cards:
            titulo_tag = card.select_one("h3 a, h2 a")
            if not titulo_tag:
                continue

            titulo = titulo_tag.get_text(strip=True)
            href = titulo_tag.get("href", "")
            if not href:
                continue

            url_detalhe = href if href.startswith("http") else BASE_URL + href
            if url_detalhe in seen_urls:
                continue
            seen_urls.add(url_detalhe)

            desc_tag = card.select_one("p")
            descricao = desc_tag.get_text(strip=True) if desc_tag else ""

            deadline = _extrair_deadline(card)

            resultados.append({
                "_url_detalhe": url_detalhe,
                "titulo": titulo,
                "descricao": descricao[:500],
                "prazo": deadline,
                "pais_destino": pais_pt,
                "fonte": "euraxess",
            })
            novos += 1

        logger.info(f"EURAXESS {pais_en} p{page}: {novos} novos cards")

        # Se página vazia ou menos de 10 resultados, chegou ao fim
        if novos == 0:
            break

        rate_limit(2.0)

    return resultados


def _scrape_detalhe(cliente: httpx.Client, item: dict) -> dict | None:
    """
    Fase 2: acessa a página de detalhe do edital no EURAXESS e extrai
    o link original ("More Information") e o nome da universidade/organização.
    """
    url_detalhe = item["_url_detalhe"]
    try:
        rate_limit(2.5)
        r = cliente.get(url_detalhe, headers=HEADERS, timeout=20)
        if r.status_code == 429:
            logger.warning(f"EURAXESS 429 (rate limit), aguardando 10s: {url_detalhe}")
            time.sleep(10)
            r = cliente.get(url_detalhe, headers=HEADERS, timeout=20)
        if r.status_code != 200:
            logger.warning(f"EURAXESS detalhe HTTP {r.status_code}: {url_detalhe}")
            return None
    except Exception as e:
        logger.error(f"EURAXESS detalhe erro: {e} — {url_detalhe}")
        return None

    soup = BeautifulSoup(r.text, "html.parser")

    # "More Information" está num <dt> seguido de <dd> com um <a>
    link_original = None
    universidade = None

    for dt in soup.find_all("dt"):
        texto_dt = dt.get_text(strip=True)

        if "More Information" in texto_dt:
            dd = dt.find_next_sibling("dd")
            if dd:
                a = dd.find("a", href=True)
                if a:
                    link_original = a["href"]

        if "Organisation name" in texto_dt:
            dd = dt.find_next_sibling("dd")
            if dd:
                universidade = dd.get_text(strip=True)

    # Fallback: se "More Information" não encontrado, usa URL do EURAXESS mesmo
    if not link_original:
        link_original = url_detalhe
        logger.debug(f"Sem 'More Information', usando URL EURAXESS: {url_detalhe}")

    edital_id = _uid(link_original)

    return {
        "id": edital_id,
        "titulo": item["titulo"],
        "descricao": item["descricao"],
        "link_edital": link_original,
        "data_publicacao": datetime.now().strftime("%Y-%m-%d"),
        "data_limite": item.get("prazo"),
        "pais_destino": item["pais_destino"],
        "universidade": universidade,
        "internacional": True,
        "fonte": "euraxess",
    }


def coletar_euraxess(paises: list[str] | None = None) -> list[dict]:
    """
    Coleta editais do EURAXESS para os países configurados.

    Args:
        paises: lista de nomes em inglês (ex: ["Italy", "Spain"]).
                Se None, usa todos os países configurados em PAISES.
    """
    alvo = {k: v for k, v in PAISES.items() if (paises is None or k in paises)}
    logger.info(f"EURAXESS: coletando para {list(alvo.keys())}")

    todos: list[dict] = []

    with httpx.Client(follow_redirects=True, timeout=30) as cliente:
        for pais_en, pais_pt in alvo.items():
            logger.info(f"── {pais_en} ──")

            # Fase 1: listing
            items_listing = _scrape_listing(cliente, pais_en, pais_pt)
            logger.info(f"{pais_en}: {len(items_listing)} editais no listing")

            # Fase 2: detalhe (extrai link original)
            editais_pais: list[dict] = []
            for item in items_listing:
                edital = _scrape_detalhe(cliente, item)
                if edital:
                    editais_pais.append(edital)

            logger.info(f"{pais_en}: {len(editais_pais)} editais com link original")
            todos.extend(editais_pais)

    salvar_json(todos, DATA_DIR / "editais_euraxess.json", logger)
    logger.info(f"EURAXESS total: {len(todos)} editais salvos")
    return todos
