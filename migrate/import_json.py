"""
PosGrad Tracker — Importa JSONs locais para o Supabase.

Uso:
  python migrate/import_json.py             # importa tudo
  python migrate/import_json.py --dry-run   # mostra o que seria enviado
  python migrate/import_json.py --only dou  # só editais DOU
  python migrate/import_json.py --only ies  # só editais IES
  python migrate/import_json.py --only intl # só editais internacionais
"""
import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent
load_dotenv(ROOT / ".env.local")

try:
    import httpx
except ImportError:
    print("Execute: pip install httpx python-dotenv")
    sys.exit(1)

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# ─── Helpers ─────────────────────────────────────────────────────────────────

AREA_KEYWORDS: dict[str, list[str]] = {
    "ciencias_exatas":             ["computação", "física", "matemática", "química", "geociências", "astronomia", "estatística", "oceanografia"],
    "ciencias_biologicas":         ["biologia", "botânica", "zoologia", "ecologia", "genética", "bioquímica", "microbiologia", "biofísica", "parasitologia", "imunologia", "farmacologia", "morfologia"],
    "engenharias":                 ["engenharia", "elétrica", "mecânica", "civil", "produção", "materiais", "química industrial", "nuclear", "aeroespacial", "transportes", "biomédica", "sanitária"],
    "ciencias_saude":              ["saúde", "medicina", "enfermagem", "farmácia", "nutrição", "odontologia", "fisioterapia", "fonoaudiologia", "educação física", "veterinária"],
    "ciencias_agrarias":           ["agronomia", "agrária", "zootecnia", "florestal", "alimentos", "pesqueiros"],
    "ciencias_sociais_aplicadas":  ["administração", "direito", "economia", "contábeis", "comunicação", "turismo", "arquitetura", "urbanismo", "serviço social", "informação"],
    "ciencias_humanas":            ["psicologia", "educação", "história", "sociologia", "filosofia", "geografia", "ciência política", "antropologia", "arqueologia", "teologia"],
    "linguistica_letras_artes":    ["linguística", "letras", "literatura", "artes", "música", "teatro", "dança"],
    "multidisciplinar":            ["biotecnologia", "ambiental", "interdisciplinar", "ensino", "materiais"],
}

NIVEL_KEYWORDS = {
    "mestrado_profissional": ["mestrado profissional", "mp em ", "m.prof"],
    "mestrado":              ["mestrado", "mestres", " m. "],
    "doutorado":             ["doutorado", "doutores", " d. "],
}

ESTADO_RE = re.compile(
    r"estado:\s*([A-Z]{2})|"
    r"\b(AC|AL|AM|AP|BA|CE|DF|ES|GO|MA|MG|MS|MT|PA|PB|PE|PI|PR|RJ|RN|RO|RR|RS|SC|SE|SP|TO)\b"
)

PRAZO_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")


def _inferir_area(texto: str) -> str | None:
    t = texto.lower()
    for area, kws in AREA_KEYWORDS.items():
        if any(kw in t for kw in kws):
            return area
    return None


def _inferir_niveis(texto: str) -> list[str]:
    t = texto.lower()
    niveis = []
    if any(kw in t for kw in NIVEL_KEYWORDS["mestrado_profissional"]):
        niveis.append("mestrado_profissional")
    if any(kw in t for kw in NIVEL_KEYWORDS["mestrado"]) and "mestrado_profissional" not in niveis:
        niveis.append("mestrado")
    if any(kw in t for kw in NIVEL_KEYWORDS["doutorado"]):
        niveis.append("doutorado")
    return niveis


def _extrair_estado(texto: str, ies_estado: str | None = None) -> str | None:
    if ies_estado:
        return ies_estado
    m = ESTADO_RE.search(texto)
    if m:
        return m.group(1) or m.group(2)
    return None


def _extrair_prazo(descricao: str, titulo: str, data_publicacao: str) -> str | None:
    for texto in (descricao, titulo):
        m = PRAZO_RE.search(texto)
        if m:
            candidato = m.group(1)
            if candidato > data_publicacao:
                return candidato
    try:
        pub = datetime.strptime(data_publicacao, "%Y-%m-%d")
        return (pub + timedelta(days=90)).strftime("%Y-%m-%d")
    except ValueError:
        return None


def _row_from_dou(edital: dict) -> dict:
    titulo = edital.get("titulo", "")
    descricao = edital.get("descricao", "")
    texto = f"{titulo} {descricao}"
    pub = edital.get("data_publicacao", "2026-01-01")

    niveis = _inferir_niveis(texto)
    return {
        "id":                 edital["id"],
        "programa_nome":      titulo[:300],
        "ies_nome":           "Federal",
        "ies_sigla":          None,
        "grande_area":        _inferir_area(texto),
        "area_especifica":    None,
        "nivel":              niveis[0] if niveis else None,
        "estado":             _extrair_estado(descricao),
        "cidade":             None,
        "modalidade":         "presencial",
        "vagas":              0,
        "prazo_inscricao":    _extrair_prazo(descricao, titulo, pub),
        "data_inicio_aulas":  None,
        "link_edital":        edital.get("link_edital"),
        "bolsas_disponiveis": False,
        "fonte":              "dou",
        "descricao":          descricao[:1000],
        "raw_json":           edital,
    }


def _row_from_internacional(edital: dict) -> dict:
    titulo = edital.get("titulo", "")
    descricao = edital.get("descricao", "")
    texto = f"{titulo} {descricao}"
    pub = edital.get("data_publicacao", "2026-01-01")

    niveis = _inferir_niveis(texto)
    # Usa nivel explícito do scraper quando disponível
    nivel_raw = edital.get("nivel")
    nivel = nivel_raw if nivel_raw else (niveis[0] if niveis else None)

    # Preserva a fonte original do JSON (euraxess, internacional, etc.)
    fonte = edital.get("fonte", "internacional")

    return {
        "id":                 edital["id"],
        "programa_nome":      titulo[:300],
        "ies_nome":           edital.get("universidade", edital.get("ies_nome", edital.get("ies_sigla", "Internacional"))),
        "ies_sigla":          edital.get("ies_sigla"),
        "grande_area":        _inferir_area(texto),
        "area_especifica":    None,
        "nivel":              nivel,
        "estado":             None,
        "cidade":             None,
        "modalidade":         "presencial",
        "vagas":              0,
        "prazo_inscricao":    edital.get("prazo_inscricao") or _extrair_prazo(descricao, titulo, pub),
        "data_inicio_aulas":  None,
        "link_edital":        edital.get("link_edital"),
        "bolsas_disponiveis": edital.get("bolsas_disponiveis", True),
        "fonte":              fonte,
        "descricao":          descricao[:1000],
        "internacional":      True,
        "pais_destino":       edital.get("pais_destino"),
        "universidade":       edital.get("universidade"),
        "raw_json":           edital,
    }


def _row_from_ies(edital: dict) -> dict:
    titulo = edital.get("titulo", "")
    descricao = edital.get("descricao", "")
    texto = f"{titulo} {descricao}"
    pub = edital.get("data_publicacao", "2026-01-01")

    niveis = _inferir_niveis(texto)
    return {
        "id":                 edital["id"],
        "programa_nome":      titulo[:300],
        "ies_nome":           edital.get("ies_nome", ""),
        "ies_sigla":          edital.get("ies_sigla"),
        "grande_area":        _inferir_area(texto),
        "area_especifica":    None,
        "nivel":              niveis[0] if niveis else None,
        "estado":             edital.get("estado"),
        "cidade":             None,
        "modalidade":         "presencial",
        "vagas":              0,
        "prazo_inscricao":    _extrair_prazo(descricao, titulo, pub),
        "data_inicio_aulas":  None,
        "link_edital":        edital.get("link_edital"),
        "bolsas_disponiveis": False,
        "fonte":              "ies",
        "descricao":          descricao[:1000],
        "raw_json":           edital,
    }


# ─── Supabase upsert ──────────────────────────────────────────────────────────

def upsert_editais(rows: list[dict], dry_run: bool = False) -> int:
    if dry_run:
        print(f"  [dry-run] {len(rows)} linhas seriam enviadas")
        for r in rows[:3]:
            print(f"    → {r['id']} | {r['programa_nome'][:60]} | {r['grande_area']} | {r['nivel']} | {r['estado']}")
        if len(rows) > 3:
            print(f"    … e mais {len(rows) - 3}")
        return len(rows)

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("⚠  SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados — modo simulação")
        return 0

    url = f"{SUPABASE_URL}/rest/v1/editais"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    # Envia em lotes de 100
    BATCH = 100
    total = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i : i + BATCH]
        with httpx.Client(timeout=30) as client:
            r = client.post(url, json=batch, headers=headers)
        if r.status_code in (200, 201):
            total += len(batch)
            print(f"  ✓ Lote {i // BATCH + 1}: {len(batch)} editais importados")
        else:
            print(f"  ✗ Lote {i // BATCH + 1} falhou [{r.status_code}]: {r.text[:200]}")
    return total


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Importa JSONs para o Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem enviar")
    parser.add_argument("--only", choices=["dou", "ies", "intl"], help="Importa só uma fonte")
    args = parser.parse_args()

    data_dir = ROOT / "data"
    total = 0

    if args.only != "ies" and args.only != "intl":
        path_dou = data_dir / "editais_dou.json"
        if path_dou.exists():
            editais = json.loads(path_dou.read_text(encoding="utf-8"))
            rows = [_row_from_dou(e) for e in editais]
            print(f"\n── DOU ({len(rows)} editais) ──────────────────────")
            total += upsert_editais(rows, dry_run=args.dry_run)

    if args.only != "dou" and args.only != "intl":
        path_ies = data_dir / "editais_ies.json"
        if path_ies.exists():
            editais = json.loads(path_ies.read_text(encoding="utf-8"))
            rows = [_row_from_ies(e) for e in editais]
            print(f"\n── IES ({len(rows)} editais) ──────────────────────")
            total += upsert_editais(rows, dry_run=args.dry_run)

    if args.only != "dou" and args.only != "ies":
        for fname, label in [
            ("editais_internacional.json", "Internacional"),
            ("editais_euraxess.json",      "Euraxess"),
            ("editais_japao.json",         "Japão"),
            ("editais_china.json",         "China"),
        ]:
            path = data_dir / fname
            if not path.exists():
                continue
            editais = json.loads(path.read_text(encoding="utf-8"))
            rows = []
            for e in editais:
                # Euraxess usa data_limite; normaliza para prazo_inscricao
                if "data_limite" in e and "prazo_inscricao" not in e:
                    e = {**e, "prazo_inscricao": e["data_limite"]}
                rows.append(_row_from_internacional(e))
            print(f"\n── {label} ({len(rows)} editais) ──────────────────────")
            total += upsert_editais(rows, dry_run=args.dry_run)

    print(f"\n✓ Total: {total} editais {'simulados' if args.dry_run else 'importados'}")


if __name__ == "__main__":
    main()
