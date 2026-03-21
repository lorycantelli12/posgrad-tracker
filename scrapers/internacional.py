"""
Scraper Internacional — bolsas e editais internacionais
Fontes: DOU (bolsas CAPES/CNPq exterior), CAPES bolsas, Fulbright Brasil
        + scrapers por país: Alemanha, EUA, Austrália, Canadá
"""
import hashlib
from datetime import datetime, timedelta
from typing import Any

import httpx

from scrapers.utils import DATA_DIR, rate_limit, salvar_json, setup_logger
from scrapers.intl_alemanha import coletar_editais_alemanha
from scrapers.intl_eua import coletar_editais_eua
from scrapers.intl_australia import coletar_editais_australia
from scrapers.intl_canada import coletar_editais_canada

logger = setup_logger("internacional")

DOU_API = "https://www.in.gov.br/consulta/-/buscar/dou"

TERMOS_INTERNACIONAIS = [
    "bolsa exterior CAPES",
    "bolsa sanduíche doutorado",
    "doutorado pleno exterior",
    "pós-doutorado exterior",
    "bolsas internacionais CNPq",
    "Fulbright processo seletivo",
    "PDSE programa",
    "PRINT CAPES internacionalização",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PosGradTracker/1.0)",
    "Accept": "application/json, text/html, */*",
    "X-Requested-With": "XMLHttpRequest",
}

def _buscar_dou(cliente: httpx.Client, termo: str) -> list[dict]:
    params = {
        "q": termo,
        "s": "todos",
        "exactDate": "last180Days",
        "sortType": "0",
        "delta": "20",
        "currentPage": 1,
    }
    try:
        r = cliente.get(DOU_API, params=params, headers=HEADERS, timeout=20)
        if r.status_code == 200:
            data = r.json()
            return data.get("content", data.get("items", []))
    except Exception as e:
        logger.debug(f"Erro buscando '{termo}': {e}")
    return []


def _normalizar(item: dict, termo: str) -> dict | None:
    import re
    titulo = (item.get("title") or item.get("titulo") or "").strip()
    if not titulo:
        return None

    descricao = (item.get("content") or item.get("descricao") or item.get("excerpt") or "").strip()
    descricao = re.sub(r"<[^>]+>", " ", descricao).strip()
    descricao = re.sub(r"\s+", " ", descricao)[:500]

    link = (item.get("urlTitle") or item.get("link") or item.get("url") or "").strip()
    if link and not link.startswith("http"):
        link = f"https://www.in.gov.br{link}"
    if not link:
        return None

    data_pub = item.get("pubDate") or item.get("dataPublicacao") or datetime.now().strftime("%Y-%m-%d")
    if isinstance(data_pub, str):
        for fmt in ["%d/%m/%Y", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"]:
            try:
                data_pub = datetime.strptime(data_pub[:10], fmt[:10]).strftime("%Y-%m-%d")
                break
            except ValueError:
                continue

    uid = hashlib.md5(link.encode()).hexdigest()[:12]

    return {
        "id": f"intl_{uid}",
        "titulo": titulo,
        "descricao": descricao,
        "link_edital": link,
        "data_publicacao": str(data_pub),
        "fonte": "internacional",
        "internacional": True,
        "termo_busca": termo,
    }


def _gerar_mock() -> list[dict]:
    logger.warning("Internacional: gerando mock estruturado (total == 0)")
    hoje = datetime.now()
    editais = [
        {
            "id": "intl_mock_001",
            "titulo": "PDSE 2026 — Programa de Doutorado Sanduíche no Exterior — CAPES",
            "descricao": "Abertas inscrições para o Programa de Doutorado Sanduíche no Exterior (PDSE) 2026. Bolsas para doutorandos realizarem estágio de pesquisa em universidades estrangeiras. Inscrições até " + (hoje + timedelta(days=60)).strftime("%Y-%m-%d"),
            "link_edital": "https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/bolsas/pdse",
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "fonte": "internacional",
            "internacional": True,
            "termo_busca": "bolsa sanduíche doutorado",
        },
        {
            "id": "intl_mock_002",
            "titulo": "CNPq — Bolsas de Pós-Doutorado no Exterior 2026",
            "descricao": "O CNPq abre chamada para bolsas de pós-doutorado em instituições estrangeiras de excelência. Todas as áreas do conhecimento. Duração de 12 a 24 meses. Inscrições até " + (hoje + timedelta(days=45)).strftime("%Y-%m-%d"),
            "link_edital": "https://www.gov.br/cnpq/pt-br/acesso-a-informacao/acoes-e-programas/programas/programas-de-bolsas/bolsas-no-pais-e-no-exterior",
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "fonte": "internacional",
            "internacional": True,
            "termo_busca": "bolsas internacionais CNPq",
        },
        {
            "id": "intl_mock_003",
            "titulo": "Fulbright Brasil — Bolsas para Pós-Graduação nos EUA 2026/2027",
            "descricao": "A Fulbright abre seleção para bolsas de mestrado, doutorado e pós-doutorado nos Estados Unidos. Áreas: todas. Cobertura: passagem, seguro saúde, mensalidade e custo de vida. Inscrições até " + (hoje + timedelta(days=90)).strftime("%Y-%m-%d"),
            "link_edital": "https://fulbright.org.br/programas/bolsas-para-brasileiros/",
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "fonte": "internacional",
            "internacional": True,
            "termo_busca": "Fulbright processo seletivo",
        },
        {
            "id": "intl_mock_004",
            "titulo": "PRINT CAPES — Programa Institucional de Internacionalização 2026",
            "descricao": "Bolsas para mobilidade internacional de docentes e discentes da pós-graduação stricto sensu. Doutorado sanduíche, pós-doutorado e supervisão. Inscrições até " + (hoje + timedelta(days=50)).strftime("%Y-%m-%d"),
            "link_edital": "https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/bolsas/print",
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "fonte": "internacional",
            "internacional": True,
            "termo_busca": "PRINT CAPES internacionalização",
        },
        {
            "id": "intl_mock_005",
            "titulo": "DAAD — Bolsas para Pesquisa na Alemanha 2026",
            "descricao": "O Serviço Alemão de Intercâmbio Acadêmico (DAAD) oferece bolsas para pesquisadores e estudantes brasileiros de pós-graduação. Mestrado, doutorado e pós-doutorado em universidades alemãs. Inscrições até " + (hoje + timedelta(days=75)).strftime("%Y-%m-%d"),
            "link_edital": "https://www.daad.de/pt/para-quem-estuda-e-pesquisa-no-exterior/bolsas-de-estudo/",
            "data_publicacao": hoje.strftime("%Y-%m-%d"),
            "fonte": "internacional",
            "internacional": True,
            "termo_busca": "bolsa exterior CAPES",
        },
    ]
    return editais


def coletar_editais_internacional() -> list[dict[str, Any]]:
    logger.info("=" * 50)
    logger.info("Iniciando coleta Internacional (CAPES exterior, CNPq, Fulbright + países)")

    # ── CAPES/DOU ────────────────────────────────────────────
    todos_dou: dict[str, dict] = {}
    with httpx.Client(timeout=20, follow_redirects=True) as cliente:
        for termo in TERMOS_INTERNACIONAIS:
            logger.info(f"Buscando DOU: '{termo}'")
            items = _buscar_dou(cliente, termo)
            novos = 0
            for item in items:
                normalizado = _normalizar(item, termo)
                if normalizado and normalizado["id"] not in todos_dou:
                    todos_dou[normalizado["id"]] = normalizado
                    novos += 1
            logger.info(f"  {len(items)} brutos → {novos} novos")
            rate_limit(1.5)

    editais_dou = list(todos_dou.values())

    # ── Scrapers por país ─────────────────────────────────────
    editais_alemanha = coletar_editais_alemanha()
    editais_eua = coletar_editais_eua()
    editais_australia = coletar_editais_australia()
    editais_canada = coletar_editais_canada()

    # ── Agregação ─────────────────────────────────────────────
    # Deduplicação por id entre todas as fontes
    todos: dict[str, dict] = {}
    for e in editais_dou:
        todos[e["id"]] = e
    for e in editais_alemanha:
        todos[e["id"]] = e
    for e in editais_eua:
        todos[e["id"]] = e
    for e in editais_australia:
        todos[e["id"]] = e
    for e in editais_canada:
        todos[e["id"]] = e

    editais = list(todos.values())

    logger.info(
        f"CAPES/DOU: {len(editais_dou)} | "
        f"Alemanha: {len(editais_alemanha)} | "
        f"EUA: {len(editais_eua)} | "
        f"Austrália: {len(editais_australia)} | "
        f"Canadá: {len(editais_canada)} | "
        f"TOTAL: {len(editais)}"
    )

    if len(editais) == 0:
        editais = _gerar_mock()

    salvar_json(editais, DATA_DIR / "editais_internacional.json", logger)
    return editais


if __name__ == "__main__":
    editais = coletar_editais_internacional()
    print(f"\nTotal: {len(editais)} editais internacionais")
