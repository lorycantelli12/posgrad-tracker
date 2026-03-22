"""
Scraper Internacional — Japão

Fontes:
  - JSPS (Japan Society for Promotion of Science) — Standard Program e Short-term
  - MEXT Research Scholarship (Ministério da Educação japonês)
  - CAPES-JSPS — acordo bilateral Brasil-Japão

Nota arquitetural:
  JSPS e MEXT são programas anuais recorrentes, sem página de listagem
  com deadlines dinâmicos (ao contrário do EURAXESS). O scraper verifica
  se a página do programa está acessível e retorna editais com prazos
  estimados baseados no ciclo anual conhecido.
"""

import hashlib
from datetime import datetime, date
from typing import Any

import httpx
from scrapers.utils import DATA_DIR, rate_limit, salvar_json, setup_logger

logger = setup_logger("intl_japao")

BASE_JSPS = "https://www.jsps.go.jp"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PosGradTracker/1.0; +https://posgrad-tracker.vercel.app)",
    "Accept": "text/html,*/*",
}


def _pagina_ok(cliente: httpx.Client, url: str) -> bool:
    """Verifica se a URL está acessível (status 200)."""
    try:
        r = cliente.head(url, headers=HEADERS, timeout=10, follow_redirects=True)
        return r.status_code == 200
    except Exception:
        return False


def _prazo_proximo_ciclo(mes_abertura: int, mes_encerramento: int) -> str | None:
    """
    Retorna a data de encerramento do próximo ciclo do programa.
    Se já passou esse mês no ano corrente, projeta para o próximo ano.
    """
    hoje = date.today()
    ano = hoje.year
    try:
        prazo = date(ano, mes_encerramento, 28)
        if prazo < hoje:
            prazo = date(ano + 1, mes_encerramento, 28)
        return prazo.strftime("%Y-%m-%d")
    except ValueError:
        return None


def coletar_editais_japao() -> list[dict[str, Any]]:
    """
    Coleta programas de bolsas para pesquisa no Japão.
    Retorna lista de editais com link para página oficial de candidatura.
    """
    logger.info("Japão: verificando programas JSPS e MEXT")

    # Programas conhecidos com ciclos anuais estabelecidos
    PROGRAMAS = [
        {
            "id": "japao_jsps_standard",
            "titulo": "JSPS Standard Program — Postdoctoral Fellowship for Research in Japan",
            "descricao": (
                "Bolsa de pós-doutorado de 12 a 24 meses no Japão, aberta a pesquisadores "
                "de todos os países com relações diplomáticas com o Japão (inclui Brasil). "
                "Todas as áreas do conhecimento. Estipêndio de JPY 362.000/mês + passagem + "
                "seguro. Candidatura submetida pelo pesquisador japonês anfitrião (host researcher). "
                "Ciclo aberto o ano todo com seleção semestral."
            ),
            "link_edital": f"{BASE_JSPS}/english/e-fellow/e-ippan/index.html",
            "prazo": _prazo_proximo_ciclo(4, 6),  # Ciclo principal: abril→junho
            "universidade": "Japan Society for the Promotion of Science (JSPS)",
        },
        {
            "id": "japao_jsps_shorterm_pa",
            "titulo": "JSPS Short-term Program (PA) — Pesquisadores da América Latina e África",
            "descricao": (
                "Bolsa de curta duração (1 a 12 meses) para pré/pós-doutorandos de países "
                "da ASEAN, América Latina e África (inclui Brasil) realizarem pesquisa colaborativa "
                "em universidades japonesas. Todas as áreas. Cobertura: passagem, subsistência "
                "e seguro. Candidatura via CAPES ou agência nacional de fomento."
            ),
            "link_edital": f"{BASE_JSPS}/english/e-fellow/e-asean-africa-s/index.html",
            "prazo": _prazo_proximo_ciclo(10, 12),  # Ciclo: outubro→dezembro
            "universidade": "Japan Society for the Promotion of Science (JSPS)",
        },
        {
            "id": "japao_mext_research",
            "titulo": "MEXT Research Scholarship — Bolsa do Ministério da Educação do Japão",
            "descricao": (
                "Bolsa do governo japonês para pesquisadores estrangeiros realizarem "
                "mestrado, doutorado ou pesquisa de pós-doutorado em universidades japonesas. "
                "Aberta a brasileiros por meio das embaixadas do Japão no Brasil. "
                "Cobertura integral: passagem, mensalidade, seguro e subsistência (JPY ~143.000/mês). "
                "Processo seletivo anual via Embaixada do Japão no Brasil."
            ),
            "link_edital": "https://www.br.emb-japan.go.jp/itpr_pt/Bolsas_MEXT.html",
            "prazo": _prazo_proximo_ciclo(1, 5),  # Inscrições: jan→maio via embaixada
            "universidade": "MEXT — Ministério da Educação, Cultura, Esportes, Ciência e Tecnologia do Japão",
        },
        {
            "id": "japao_capes_jsps",
            "titulo": "Acordo CAPES-JSPS — Programa de Missões de Pesquisa Brasil-Japão",
            "descricao": (
                "Programa bilateral CAPES-JSPS que financia missões de pesquisa de pesquisadores "
                "brasileiros em instituições japonesas parceiras. Voltado para doutores com vínculo "
                "em IES/institutos de pesquisa brasileiros. Duração: 1 a 12 meses. "
                "Inscrições via CAPES com chamada publicada no DOU."
            ),
            "link_edital": "https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/bolsas/bolsas-e-auxilios-internacionais/japao",
            "prazo": _prazo_proximo_ciclo(3, 7),  # Chamadas CAPES: mar→jul
            "universidade": "CAPES / Japan Society for the Promotion of Science (JSPS)",
        },
    ]

    editais = []
    with httpx.Client(follow_redirects=True, timeout=15) as cliente:
        for prog in PROGRAMAS:
            rate_limit(1.0)
            ok = _pagina_ok(cliente, prog["link_edital"])
            status = "✓ acessível" if ok else "⚠ sem resposta"
            logger.info(f"Japão [{prog['id']}]: {status} → {prog['link_edital']}")

            editais.append({
                "id": prog["id"],
                "titulo": prog["titulo"],
                "descricao": prog["descricao"],
                "link_edital": prog["link_edital"],
                "data_publicacao": datetime.now().strftime("%Y-%m-%d"),
                "data_limite": prog["prazo"],
                "pais_destino": "japao",
                "universidade": prog["universidade"],
                "internacional": True,
                "fonte": "japao",
            })

    salvar_json(editais, DATA_DIR / "editais_japao.json", logger)
    logger.info(f"Japão: {len(editais)} programas coletados")
    return editais
