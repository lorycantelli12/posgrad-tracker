"""
Scraper Internacional — China

Fontes:
  - CSC (China Scholarship Council) — Chinese Government Scholarship
  - Embaixada da China no Brasil
  - CAPES-China (acordos bilaterais)
  - Confucius Institute Scholarships

Nota arquitetural:
  O portal CSC (studyinchina.csc.edu.cn) exige login para listagem.
  A estratégia é verificar as páginas públicas de cada programa e gerar
  editais com links diretos para candidatura, com prazos do ciclo anual.
"""

import hashlib
from datetime import datetime, date
from typing import Any

import httpx
from scrapers.utils import DATA_DIR, rate_limit, salvar_json, setup_logger

logger = setup_logger("intl_china")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PosGradTracker/1.0; +https://posgrad-tracker.vercel.app)",
    "Accept": "text/html,*/*",
}


def _pagina_ok(cliente: httpx.Client, url: str) -> bool:
    try:
        r = cliente.head(url, headers=HEADERS, timeout=10, follow_redirects=True)
        return r.status_code < 400
    except Exception:
        return False


def _prazo_proximo_ciclo(mes_encerramento: int) -> str | None:
    hoje = date.today()
    ano = hoje.year
    try:
        prazo = date(ano, mes_encerramento, 25)
        if prazo < hoje:
            prazo = date(ano + 1, mes_encerramento, 25)
        return prazo.strftime("%Y-%m-%d")
    except ValueError:
        return None


def coletar_editais_china() -> list[dict[str, Any]]:
    """
    Coleta programas de bolsas para pesquisa/estudo na China.
    """
    logger.info("China: verificando programas CSC, Embaixada e CAPES")

    PROGRAMAS = [
        {
            "id": "china_csc_government",
            "titulo": "Chinese Government Scholarship (CSC) — Bolsa do Governo Chinês para Estrangeiros",
            "descricao": (
                "Programa oficial do governo chinês para estrangeiros realizarem graduação, "
                "mestrado, doutorado ou pesquisa de pós-doutorado em universidades chinesas. "
                "Aberto a brasileiros por meio do China Scholarship Council (CSC). "
                "Cobertura: mensalidade, acomodação, subsistência (CNY 3.500/mês pós-graduação), "
                "seguro saúde e passagem. Inscrições via portal CSC entre janeiro e abril."
            ),
            "link_edital": "https://www.chinesescholarshipcouncil.com/chinese-government-scholarship/",
            "prazo": _prazo_proximo_ciclo(4),  # Prazo típico: abril
            "universidade": "China Scholarship Council (CSC) — Ministério da Educação da China",
        },
        {
            "id": "china_embaixada_brasil",
            "titulo": "Bolsas da Embaixada da China no Brasil — Programa de Bolsas do Governo Chinês",
            "descricao": (
                "A Embaixada da China no Brasil abre anualmente inscrições para o Programa de "
                "Bolsas do Governo Chinês destinado a estudantes brasileiros. Cobre mestrado, "
                "doutorado e pesquisa em universidades designadas na China. "
                "Processo seletivo conduzido pela Embaixada com documentação em português. "
                "Inscrições geralmente entre janeiro e março de cada ano."
            ),
            "link_edital": "http://br.china-embassy.gov.cn/por/jy/",
            "prazo": _prazo_proximo_ciclo(3),  # Prazo: março
            "universidade": "Embaixada da República Popular da China no Brasil",
        },
        {
            "id": "china_confucius_scholarship",
            "titulo": "Confucius Institute Scholarship — Bolsa para Estudos de Língua e Cultura Chinesa",
            "descricao": (
                "Bolsa do Instituto Confúcio para estudantes estrangeiros realizarem programa "
                "de língua e cultura chinesa em universidades parceiras na China. "
                "Duração: 1 semestre ou 1 ano. Voltado para nível de graduação e pós-graduação. "
                "Candidatura via Instituto Confúcio parceiro no Brasil "
                "(USP, UFRJ, UFMG, UFC, entre outros). Inscrições: março a maio."
            ),
            "link_edital": "https://chinese.hust.edu.cn/Admission/Scholarship/Confucius_Institute_Scholarship.htm",
            "prazo": _prazo_proximo_ciclo(5),  # Prazo: maio
            "universidade": "Hanban / Instituto Confúcio International",
        },
        {
            "id": "china_capes_bilateral",
            "titulo": "Acordo CAPES-China — Programa de Cooperação Científica Brasil-China",
            "descricao": (
                "Programa bilateral CAPES-MEC China que financia mobilidade de pesquisadores "
                "e estudantes de pós-graduação brasileiros para instituições chinesas parceiras. "
                "Modalidades: doutorado pleno, doutorado sanduíche e pós-doutorado. "
                "Inscrições via CAPES com chamada publicada no Diário Oficial da União. "
                "Duração: 6 a 12 meses."
            ),
            "link_edital": "https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/bolsas/bolsas-e-auxilios-internacionais/china",
            "prazo": _prazo_proximo_ciclo(6),  # Chamadas CAPES: jun
            "universidade": "CAPES / Ministry of Education of the People's Republic of China",
        },
    ]

    editais = []
    with httpx.Client(follow_redirects=True, timeout=15) as cliente:
        for prog in PROGRAMAS:
            rate_limit(1.0)
            ok = _pagina_ok(cliente, prog["link_edital"])
            status = "✓ acessível" if ok else "⚠ sem resposta"
            logger.info(f"China [{prog['id']}]: {status} → {prog['link_edital']}")

            editais.append({
                "id": prog["id"],
                "titulo": prog["titulo"],
                "descricao": prog["descricao"],
                "link_edital": prog["link_edital"],
                "data_publicacao": datetime.now().strftime("%Y-%m-%d"),
                "data_limite": prog["prazo"],
                "pais_destino": "china",
                "universidade": prog["universidade"],
                "internacional": True,
                "fonte": "china",
            })

    salvar_json(editais, DATA_DIR / "editais_china.json", logger)
    logger.info(f"China: {len(editais)} programas coletados")
    return editais
