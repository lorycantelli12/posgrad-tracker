"""
Orquestrador do pipeline de scraping — PosGrad Tracker.

Uso:
  python scrapers/main.py editais        # Coleta editais (DOU + IES)
  python scrapers/main.py programas      # Coleta programas CAPES
  python scrapers/main.py internacional  # Coleta editais internacionais
  python scrapers/main.py all            # Tudo + upsert Supabase
"""
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent
load_dotenv(ROOT / ".env.local")

from scrapers.utils import DATA_DIR, LOGS_DIR, setup_logger

logger = setup_logger("main")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def _resumo_json(caminho: Path) -> str:
    """Retorna contagem de registros de um JSON."""
    try:
        with open(caminho, encoding="utf-8") as f:
            dados = json.load(f)
        return f"{len(dados)} registros"
    except Exception:
        return "arquivo não encontrado"


def coletar_programas() -> bool:
    """Roda o scraper CAPES."""
    logger.info(">>> FASE: Programas CAPES")
    try:
        from scrapers.capes_sucupira import coletar_programas as scrape
        programas = scrape()
        logger.info(f"✓ CAPES: {len(programas)} programas")
        return len(programas) >= 100
    except Exception as e:
        logger.error(f"✗ CAPES falhou: {e}")
        return False


def coletar_editais() -> bool:
    """Roda scrapers DOU + IES."""
    sucesso = True

    # DOU
    logger.info(">>> FASE: Editais DOU Federal")
    try:
        from scrapers.dou_federal import coletar_editais_dou
        editais_dou = coletar_editais_dou()
        logger.info(f"✓ DOU: {len(editais_dou)} editais")
        if len(editais_dou) < 10:
            logger.warning("⚠ DOU abaixo do mínimo (10)")
            sucesso = False
    except Exception as e:
        logger.error(f"✗ DOU falhou: {e}")
        sucesso = False

    # IES
    logger.info(">>> FASE: Editais IES")
    try:
        from scrapers.ies_editais import coletar_editais_ies
        editais_ies = coletar_editais_ies()
        logger.info(f"✓ IES: {len(editais_ies)} editais")
        if len(editais_ies) < 20:
            logger.warning("⚠ IES abaixo do mínimo (20)")
            sucesso = False
    except Exception as e:
        logger.error(f"✗ IES falhou: {e}")
        sucesso = False

    return sucesso


def coletar_internacional() -> bool:
    """Roda o scraper de editais internacionais."""
    logger.info(">>> FASE: Editais Internacionais")
    try:
        from scrapers.internacional import coletar_editais_internacional
        editais = coletar_editais_internacional()
        logger.info(f"✓ Internacional: {len(editais)} editais")
        if len(editais) < 5:
            logger.warning("⚠ Internacional abaixo do mínimo (5)")
            return False
        return True
    except Exception as e:
        logger.error(f"✗ Internacional falhou: {e}")
        return False


def imprimir_resumo() -> None:
    """Exibe resumo dos JSONs gerados."""
    logger.info("\n" + "=" * 50)
    logger.info("RESUMO DOS ARQUIVOS GERADOS:")
    arquivos = [
        ("programas.json", 500),
        ("editais_dou.json", 10),
        ("editais_ies.json", 20),
        ("editais_internacional.json", 5),
    ]
    tudo_ok = True
    for nome, minimo in arquivos:
        caminho = DATA_DIR / nome
        if caminho.exists():
            with open(caminho, encoding="utf-8") as f:
                qtd = len(json.load(f))
            status = "✓" if qtd >= minimo else "⚠"
            if qtd < minimo:
                tudo_ok = False
            logger.info(f"  {status} {nome}: {qtd} registros (mín: {minimo})")
        else:
            logger.warning(f"  ✗ {nome}: não gerado")
            tudo_ok = False

    logger.info(f"\nLog completo: {LOGS_DIR / 'scraper.log'}")
    if tudo_ok:
        logger.info("STATUS FINAL: ✓ Todos os critérios atingidos")
    else:
        logger.warning("STATUS FINAL: ⚠ Alguns arquivos abaixo do mínimo")


def upsert_supabase() -> bool:
    """Envia os JSONs gerados para o Supabase via migrate/import_json.py."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("⚠ SUPABASE não configurado — pulando upsert")
        return True  # não é falha, só não faz nada

    logger.info(">>> FASE: Upsert Supabase")
    try:
        import subprocess
        result = subprocess.run(
            [sys.executable, "migrate/import_json.py"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode == 0:
            logger.info(result.stdout.strip())
            return True
        else:
            logger.error(f"✗ Upsert falhou:\n{result.stderr}")
            return False
    except Exception as e:
        logger.error(f"✗ Upsert falhou: {e}")
        return False


def invocar_run_matching() -> None:
    """Invoca a Edge Function run-matching via HTTP após o upsert."""
    if not SUPABASE_URL:
        return

    try:
        import httpx
        url = f"{SUPABASE_URL}/functions/v1/run-matching"
        headers = {
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
        }
        r = httpx.post(url, json={}, headers=headers, timeout=60)
        if r.status_code == 200:
            data = r.json()
            logger.info(f"✓ run-matching: {data.get('matches_updated', '?')} matches atualizados")
        else:
            logger.warning(f"⚠ run-matching [{r.status_code}]: {r.text[:200]}")
    except Exception as e:
        logger.warning(f"⚠ run-matching falhou (não crítico): {e}")


def main() -> None:
    modo = sys.argv[1].lower() if len(sys.argv) > 1 else "all"

    logger.info("=" * 50)
    logger.info(f"PosGrad Tracker — Scraper [{modo}]")
    logger.info("=" * 50)

    inicio = time.time()

    if modo in ("programas", "all"):
        coletar_programas()

    if modo in ("editais", "all"):
        coletar_editais()

    if modo in ("internacional", "all"):
        coletar_internacional()

    if modo == "all":
        upsert_supabase()
        invocar_run_matching()

    elapsed = time.time() - inicio
    logger.info(f"\nTempo total: {elapsed:.1f}s")
    imprimir_resumo()


if __name__ == "__main__":
    main()
