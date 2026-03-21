"""
PosGrad Tracker — Matching Engine

Cruza perfis de usuário com editais e programas CAPES,
gerando lista ranqueada por score de relevância.

Uso:
  python matching/run.py --grandes_areas "ciencias_humanas" --estados "SP" --niveis "mestrado"
  python matching/run.py --test-all
"""

import argparse
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"

# ---------------------------------------------------------------------------
# Mapeamento de palavras-chave → grande_area
# ---------------------------------------------------------------------------
AREA_KEYWORDS: dict[str, list[str]] = {
    "ciencias_exatas": [
        "física", "física teórica", "matemática", "química", "computação",
        "ciência da computação", "informática", "estatística", "astronomia",
        "ciências exatas", "geociências", "oceanografia",
    ],
    "engenharias": [
        "engenharia", "engenheiro", "engenharia civil", "engenharia elétrica",
        "engenharia mecânica", "engenharia química", "engenharia de produção",
        "engenharia de software", "materiais",
    ],
    "ciencias_biologicas": [
        "biologia", "bioquímica", "genética", "ecologia", "zoologia", "botânica",
        "microbiologia", "imunologia", "biofísica", "biotecnologia", "parasitologia",
        "ciências biológicas",
    ],
    "ciencias_saude": [
        "medicina", "saúde", "saúde coletiva", "enfermagem", "farmácia",
        "odontologia", "nutrição", "fisioterapia", "fonoaudiologia", "terapia",
        "psiquiatria", "cardiologia", "infectologia", "ciências da saúde",
    ],
    "ciencias_agrarias": [
        "agronomia", "veterinária", "medicina veterinária", "zootecnia",
        "florestal", "agronegócio", "agricultura", "solos", "fitotecnia",
        "ciências agrárias",
    ],
    "ciencias_humanas": [
        "psicologia", "filosofia", "história", "sociologia", "antropologia",
        "educação", "pedagogia", "ciências da religião", "arqueologia",
        "ciências humanas",
    ],
    "ciencias_sociais_aplicadas": [
        "direito", "administração", "economia", "contabilidade", "comunicação",
        "serviço social", "ciências sociais", "políticas públicas", "turismo",
        "relações internacionais", "urbanismo", "planejamento urbano",
    ],
    "linguistica_letras": [
        "letras", "linguística", "literatura", "língua portuguesa", "tradução",
        "estudos literários", "linguagem",
    ],
    "artes": [
        "arte", "artes", "música", "cinema", "teatro", "dança", "design",
        "arquitetura", "artes visuais",
    ],
}

NIVEL_KEYWORDS: dict[str, str] = {
    "mestrado profissional": "mestrado_profissional",
    "mestrado_profissional": "mestrado_profissional",
    "mestrado acadêmico": "mestrado",
    "doutorado": "doutorado",
    "mestrado": "mestrado",
    "pós-doutorado": "pos_doutorado",
    "pos-doutorado": "pos_doutorado",
    "pós doutorado": "pos_doutorado",
    "pos_doutorado": "pos_doutorado",
    "postdoc": "pos_doutorado",
    "post-doc": "pos_doutorado",
}

EAD_KEYWORDS = ["ead", "educação a distância", "a distância", "online", "remoto", "semipresencial"]

# Palavras-chave que confirmam que o IES edital é um processo seletivo PPG
PPG_KEYWORDS = [
    "mestrado", "doutorado", "pós-graduação", "pos-graduação", "posgraduação",
    "ppg", "processo seletivo", "edital de seleção", "seleção de candidatos",
    "stricto sensu", "programa de pós",
    "pós-doutorado", "pos-doutorado", "postdoc", "bolsa exterior", "bolsa internacional",
    "programa de bolsas", "bolsas no exterior",
]

ESTADO_RE = re.compile(
    r"\bEstado:\s*([A-Z]{2})\b|"
    r"\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b"
)


# ---------------------------------------------------------------------------
# Funções de inferência
# ---------------------------------------------------------------------------

def _inferir_area(texto: str) -> Optional[str]:
    t = texto.lower()
    for area, palavras in AREA_KEYWORDS.items():
        if any(p in t for p in palavras):
            return area
    return None


def _inferir_niveis(texto: str) -> list[str]:
    """Infere nível(is) a partir do texto. Retorna lista vazia se não encontrado."""
    t = texto.lower()
    niveis: list[str] = []
    # Ordem importa: checar "mestrado profissional" antes de "mestrado"
    for keyword, nivel in NIVEL_KEYWORDS.items():
        if keyword in t and nivel not in niveis:
            niveis.append(nivel)
    return niveis


def _inferir_ead(texto: str) -> bool:
    t = texto.lower()
    return any(k in t for k in EAD_KEYWORDS)


def _extrair_estado_dou(texto: str) -> Optional[str]:
    """Extrai estado de textos DOU (ex: 'Estado: MG' ou sigla explícita)."""
    m = ESTADO_RE.search(texto)
    if m:
        return m.group(1) or m.group(2)
    return None


def _extrair_prazo(descricao: str, titulo: str, data_publicacao: str) -> str:
    """
    Extrai prazo de inscrição do texto.
    Prioridade: data após 'Inscrições até' → qualquer YYYY-MM-DD → DD/MM/YYYY → pub+90d.
    """
    texto = titulo + " " + descricao

    # "Inscrições até YYYY-MM-DD" ou "até DD/MM/YYYY"
    m = re.search(r"[Ii]nscri(?:ções|çoes)\s+até\s+(\d{4}-\d{2}-\d{2})", texto)
    if m:
        return m.group(1)

    m = re.search(r"[Ii]nscri(?:ções|çoes)\s+até\s+(\d{2}/\d{2}/\d{4})", texto)
    if m:
        d, mo, y = m.group(1).split("/")
        return f"{y}-{mo}-{d}"

    # Qualquer data YYYY-MM-DD no texto (excluindo data de publicação)
    datas = re.findall(r"(\d{4}-\d{2}-\d{2})", descricao)
    datas_futuras = [d for d in datas if d > data_publicacao]
    if datas_futuras:
        return datas_futuras[0]

    # Fallback: publicação + 90 dias
    try:
        pub = datetime.strptime(data_publicacao, "%Y-%m-%d")
        return (pub + timedelta(days=90)).strftime("%Y-%m-%d")
    except ValueError:
        return (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")


# ---------------------------------------------------------------------------
# Algoritmo de score (AC3)
# ---------------------------------------------------------------------------

def calcular_score(
    grande_area_edital: Optional[str],
    estado_edital: Optional[str],
    niveis_edital: list[str],
    e_ead: bool,
    perfil: dict,
    edital_eh_internacional: bool = False,
) -> int:
    """
    Pesos:
      área      → 40 pts
      estado    → 30 pts (15 pts se edital federal/sem estado)
      nível     → 20 pts
      modalidade→ 10 pts (bônus para EaD aceito; presencial = neutro)

    Regras de inferência:
    - área não inferida  + usuário tem preferência → 0 (não assumir match)
    - nível não inferido + usuário tem preferência → 0 (não assumir match)
    - edital sem estado  (DOU federal) + usuário tem preferência → 15 pts parciais
    """
    score = 0

    # Área (40 pts)
    areas_usuario = perfil.get("grandes_areas", [])
    if not areas_usuario:
        score += 40  # usuário aceita qualquer área
    elif grande_area_edital and grande_area_edital in areas_usuario:
        score += 40
    # else: área não inferida ou não coincide → 0

    # Estado (30 pts)
    estados_usuario = perfil.get("estados", [])
    if not estados_usuario:
        score += 30  # aceita qualquer estado
    elif estado_edital and estado_edital in estados_usuario:
        score += 30
    elif not estado_edital:
        score += 15  # edital federal/sem estado → relevância parcial

    # Nível (20 pts)
    niveis_usuario = perfil.get("niveis", [])
    if not niveis_usuario:
        score += 20  # aceita qualquer nível
    elif niveis_edital and any(n in niveis_usuario for n in niveis_edital):
        score += 20
    # else: nível não inferido com preferência de usuário → 0

    # Modalidade (10 pts — bônus para EaD, presencial é neutro)
    aceita_ead = perfil.get("aceita_ead", False)
    if e_ead and aceita_ead:
        score += 10  # bônus: EaD aceito pelo usuário

    # Internacional (bônus 10 pts se edital é internacional e usuário aceita)
    if perfil.get("aceita_internacional", False) and edital_eh_internacional:
        score += 10

    return score


# ---------------------------------------------------------------------------
# Carregamento e indexação
# ---------------------------------------------------------------------------

def carregar_dados() -> tuple[list, list, list, list]:
    def _load(path: Path) -> list:
        if not path.exists():
            print(f"⚠  {path.name} não encontrado (rode: python3 -m scrapers.main all)", file=sys.stderr)
            return []
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    return (
        _load(DATA_DIR / "programas.json"),
        _load(DATA_DIR / "editais_dou.json"),
        _load(DATA_DIR / "editais_ies.json"),
        _load(DATA_DIR / "editais_internacional.json"),
    )


def _build_ies_index(programas: list) -> dict[str, list[dict]]:
    """ies_sigla → lista de programas."""
    idx: dict[str, list] = {}
    for p in programas:
        sigla = p.get("ies_sigla", "")
        if sigla:
            idx.setdefault(sigla, []).append(p)
    return idx


# ---------------------------------------------------------------------------
# Matching por tipo de edital
# ---------------------------------------------------------------------------

def _e_ppg_relevante(titulo: str, descricao: str) -> bool:
    """
    Verifica se o IES edital é sobre seleção de PPG (mestrado/doutorado).
    Checa o titulo primeiro (principal); descricao apenas se não for o template genérico.
    """
    t = titulo.lower()
    if any(kw in t for kw in PPG_KEYWORDS):
        return True
    # Ignora descrições geradas com template genérico "Edital de seleção da IES"
    if descricao.startswith("Edital de seleção da "):
        return False
    return any(kw in descricao.lower() for kw in PPG_KEYWORDS)


def _processar_ies(
    edital: dict,
    ies_index: dict,
    perfil: dict,
    hoje: datetime,
) -> Optional[dict]:
    titulo = edital.get("titulo", "")
    descricao = edital.get("descricao", "")
    data_pub = edital.get("data_publicacao", "")
    sigla = edital.get("ies_sigla", "")
    estado = edital.get("estado") or _extrair_estado_dou(titulo + " " + descricao)

    # Filtra editais que não são seleções PPG (prêmios, bolsas, eventos, etc.)
    if not _e_ppg_relevante(titulo, descricao):
        return None

    prazo_str = _extrair_prazo(descricao, titulo, data_pub)
    try:
        if datetime.strptime(prazo_str, "%Y-%m-%d") < hoje:
            return None  # AC6: prazo vencido
    except ValueError:
        pass

    texto = titulo + " " + descricao
    grande_area = _inferir_area(texto)
    niveis = _inferir_niveis(texto)
    e_ead = _inferir_ead(texto)
    eh_internacional = any(k in texto.lower() for k in [
        "exterior", "internacional", "international", "fulbright", "capes", "cnpq",
        "bolsa sanduíche", "sandwich", "pleno exterior"
    ])

    score = calcular_score(grande_area, estado, niveis, e_ead, perfil, edital_eh_internacional=eh_internacional)
    if score == 0:
        return None  # AC7

    # Busca programa correspondente na IES com mesma área (para enriquecer output)
    programas_ies = ies_index.get(sigla, [])
    programa_match = None
    if grande_area:
        programa_match = next(
            (p for p in programas_ies if p.get("grande_area") == grande_area),
            None,
        )

    nivel_output = niveis[0] if niveis else "mestrado"

    return {
        "edital_id": edital["id"],
        "programa_nome": programa_match["nome"] if programa_match else titulo[:80],
        "ies_nome": edital.get("ies_nome", sigla),
        "estado": estado or "—",
        "nivel": nivel_output,
        "prazo_inscricao": prazo_str,
        "link_edital": edital.get("link_edital", ""),
        "score": score,
    }


def _processar_dou(
    edital: dict,
    perfil: dict,
    hoje: datetime,
) -> Optional[dict]:
    titulo = edital.get("titulo", "")
    descricao = edital.get("descricao", "")
    data_pub = edital.get("data_publicacao", "")

    prazo_str = _extrair_prazo(descricao, titulo, data_pub)
    try:
        if datetime.strptime(prazo_str, "%Y-%m-%d") < hoje:
            return None  # AC6: prazo vencido
    except ValueError:
        pass

    texto = titulo + " " + descricao
    grande_area = _inferir_area(texto)
    estado = _extrair_estado_dou(texto)
    niveis = _inferir_niveis(texto)
    e_ead = _inferir_ead(texto)
    eh_internacional = any(k in texto.lower() for k in [
        "exterior", "internacional", "international", "fulbright", "capes", "cnpq",
        "bolsa sanduíche", "sandwich", "pleno exterior"
    ])

    score = calcular_score(grande_area, estado, niveis, e_ead, perfil, edital_eh_internacional=eh_internacional)
    if score == 0:
        return None  # AC7

    nivel_output = niveis[0] if niveis else "mestrado"

    return {
        "edital_id": edital["id"],
        "programa_nome": titulo[:80],
        "ies_nome": "Diário Oficial da União",
        "estado": estado or "Nacional",
        "nivel": nivel_output,
        "prazo_inscricao": prazo_str,
        "link_edital": edital.get("link_edital", ""),
        "score": score,
    }


# ---------------------------------------------------------------------------
# Função principal de matching (AC1–AC7)
# ---------------------------------------------------------------------------

def rodar_matching(perfil: dict) -> list[dict]:
    """Executa matching e retorna lista ranqueada por score."""
    programas, editais_dou, editais_ies, editais_internacional = carregar_dados()
    ies_index = _build_ies_index(programas)
    hoje = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    vistos: set[str] = set()  # AC5: deduplicação por edital_id
    resultados: list[dict] = []

    for edital in editais_ies:
        res = _processar_ies(edital, ies_index, perfil, hoje)
        if res and res["edital_id"] not in vistos:
            vistos.add(res["edital_id"])
            resultados.append(res)

    for edital in editais_dou:
        res = _processar_dou(edital, perfil, hoje)
        if res and res["edital_id"] not in vistos:
            vistos.add(res["edital_id"])
            resultados.append(res)

    for edital in editais_internacional:
        res = _processar_dou(edital, perfil, hoje)  # reutiliza o processador DOU
        if res and res["edital_id"] not in vistos:
            vistos.add(res["edital_id"])
            resultados.append(res)

    return sorted(resultados, key=lambda x: x["score"], reverse=True)


# ---------------------------------------------------------------------------
# Modo --test-all (AC8)
# ---------------------------------------------------------------------------

def rodar_todos_perfis() -> None:
    test_path = Path(__file__).parent / "test_profiles.json"
    if not test_path.exists():
        print(f"❌ {test_path} não encontrado", file=sys.stderr)
        sys.exit(1)

    with open(test_path, encoding="utf-8") as f:
        perfis = json.load(f)

    print("=" * 65)
    print("PosGrad Tracker — Teste de Matching (todos os perfis)")
    print("=" * 65)

    for perfil in perfis:
        print(f"\n{'─' * 65}")
        print(f"[{perfil['id']}] {perfil['descricao']}")
        print(f"  Áreas:   {perfil.get('grandes_areas', [])}")
        print(f"  Estados: {perfil.get('estados', []) or 'Qualquer'}")
        print(f"  Níveis:  {perfil.get('niveis', []) or 'Qualquer'}")
        print(f"  EaD:     {perfil.get('aceita_ead', False)}")
        print()

        resultados = rodar_matching(perfil)

        if not resultados:
            print("  ℹ  Nenhum edital encontrado para este perfil.")
        else:
            print(f"  ✓ {len(resultados)} editais encontrados — top 5:\n")
            for r in resultados[:5]:
                print(
                    f"  [{r['score']:3d}pts] {r['programa_nome'][:50]:<50}"
                    f" | {r['ies_nome'][:25]:<25} | {r['estado']:3} | prazo {r['prazo_inscricao']}"
                )

    print("\n" + "=" * 65)
    print("✓ Todos os perfis processados com sucesso.")


# ---------------------------------------------------------------------------
# CLI (AC1)
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="PosGrad Tracker — Matching de editais por perfil",
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=(
            "Exemplos:\n"
            '  python matching/run.py --grandes_areas "ciencias_humanas" --estados "SP" --niveis "mestrado"\n'
            '  python matching/run.py --grandes_areas "engenharias,ciencias_exatas" --estados "MG" --niveis "mestrado,doutorado" --aceita_ead\n'
            "  python matching/run.py --test-all"
        ),
    )
    parser.add_argument(
        "--grandes_areas",
        type=str,
        default="",
        help='Grandes áreas separadas por vírgula.\nEx: "ciencias_humanas,engenharias"\nVazio = aceita qualquer área.',
    )
    parser.add_argument(
        "--estados",
        type=str,
        default="",
        help='Estados (sigla) separados por vírgula.\nEx: "SP,RJ"\nVazio = aceita qualquer estado.',
    )
    parser.add_argument(
        "--niveis",
        type=str,
        default="",
        help='Níveis separados por vírgula.\nEx: "mestrado,doutorado"\nVazio = aceita qualquer nível.',
    )
    parser.add_argument(
        "--aceita_ead",
        action="store_true",
        default=False,
        help="Aceita modalidade EaD.",
    )
    parser.add_argument(
        "--test-all",
        action="store_true",
        default=False,
        help="Roda todos os perfis de matching/test_profiles.json",
    )
    parser.add_argument(
        "--top",
        type=int,
        default=20,
        help="Número máximo de resultados (default: 20)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Salva resultado em arquivo JSON. Ex: --output resultado.json",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        default=False,
        help="Imprime resultado em JSON puro (silencia texto).",
    )

    args = parser.parse_args()

    if args.test_all:
        rodar_todos_perfis()
        return

    perfil = {
        "id": "cli",
        "grandes_areas": [a.strip() for a in args.grandes_areas.split(",") if a.strip()],
        "estados": [e.strip().upper() for e in args.estados.split(",") if e.strip()],
        "niveis": [n.strip() for n in args.niveis.split(",") if n.strip()],
        "aceita_ead": args.aceita_ead,
    }

    if not args.json:
        print("Perfil:")
        print(f"  Áreas:   {perfil['grandes_areas'] or 'Qualquer'}")
        print(f"  Estados: {perfil['estados'] or 'Qualquer'}")
        print(f"  Níveis:  {perfil['niveis'] or 'Qualquer'}")
        print(f"  EaD:     {perfil['aceita_ead']}")
        print()

    resultados = rodar_matching(perfil)[: args.top]

    if not resultados:
        if not args.json:
            print("ℹ  Nenhum edital encontrado para este perfil.")
        sys.exit(0)

    if not args.json:
        print(f"✓ {len(resultados)} editais encontrados\n")
        for i, r in enumerate(resultados, 1):
            print(f"{i:2d}. [{r['score']:3d}pts] {r['programa_nome'][:60]}")
            print(f"     {r['ies_nome']} — {r['estado']} — {r['nivel']}")
            print(f"     Prazo: {r['prazo_inscricao']} | {r['link_edital'][:60]}")
            print()

    if args.output:
        out_path = Path(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(resultados, f, ensure_ascii=False, indent=2)
        if not args.json:
            print(f"✓ Resultado salvo em {out_path}")
    else:
        if args.json:
            print(json.dumps(resultados, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
