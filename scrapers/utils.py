"""Utilitários compartilhados entre scrapers."""
import logging
import time
from pathlib import Path
from typing import Any

# Diretórios
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"

DATA_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)


def setup_logger(name: str) -> logging.Logger:
    """Configura logger com output em arquivo e console."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if logger.handlers:
        return logger

    fmt = logging.Formatter(
        "%(asctime)s [%(name)s] %(levelname)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Arquivo
    fh = logging.FileHandler(LOGS_DIR / "scraper.log", encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    # Console
    ch = logging.StreamHandler()
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    return logger


def rate_limit(seconds: float = 1.5) -> None:
    """Pausa entre requests para não sobrecarregar o servidor."""
    time.sleep(seconds)


# Mapeamento: área CAPES → grande_area do nosso sistema
AREA_PARA_GRANDE_AREA: dict[str, str] = {
    # Ciências Exatas
    "ASTRONOMIA": "ciencias_exatas",
    "CIÊNCIA DA COMPUTAÇÃO": "ciencias_exatas",
    "FÍSICA": "ciencias_exatas",
    "GEOCIÊNCIAS": "ciencias_exatas",
    "MATEMÁTICA": "ciencias_exatas",
    "OCEANOGRAFIA": "ciencias_exatas",
    "PROBABILIDADE E ESTATÍSTICA": "ciencias_exatas",
    "QUÍMICA": "ciencias_exatas",
    # Ciências Biológicas
    "BIOFÍSICA": "ciencias_biologicas",
    "BIOLOGIA GERAL": "ciencias_biologicas",
    "BIOQUÍMICA": "ciencias_biologicas",
    "BOTÂNICA": "ciencias_biologicas",
    "ECOLOGIA": "ciencias_biologicas",
    "FARMACOLOGIA": "ciencias_biologicas",
    "FISIOLOGIA": "ciencias_biologicas",
    "GENÉTICA": "ciencias_biologicas",
    "IMUNOLOGIA": "ciencias_biologicas",
    "MICROBIOLOGIA": "ciencias_biologicas",
    "MORFOLOGIA": "ciencias_biologicas",
    "PARASITOLOGIA": "ciencias_biologicas",
    "ZOOLOGIA": "ciencias_biologicas",
    # Engenharias
    "ENGENHARIA AEROESPACIAL": "engenharias",
    "ENGENHARIA BIOMÉDICA": "engenharias",
    "ENGENHARIA CIVIL": "engenharias",
    "ENGENHARIA DE MINAS": "engenharias",
    "ENGENHARIA DE PRODUÇÃO": "engenharias",
    "ENGENHARIA DE TRANSPORTES": "engenharias",
    "ENGENHARIA ELÉTRICA": "engenharias",
    "ENGENHARIA MECÂNICA": "engenharias",
    "ENGENHARIA NAVAL": "engenharias",
    "ENGENHARIA NUCLEAR": "engenharias",
    "ENGENHARIA QUÍMICA": "engenharias",
    "ENGENHARIA SANITÁRIA": "engenharias",
    "MATERIAIS": "engenharias",
    # Ciências da Saúde
    "EDUCAÇÃO FÍSICA": "ciencias_saude",
    "ENFERMAGEM": "ciencias_saude",
    "FARMÁCIA": "ciencias_saude",
    "FISIOTERAPIA E TERAPIA OCUPACIONAL": "ciencias_saude",
    "FONOAUDIOLOGIA": "ciencias_saude",
    "MEDICINA": "ciencias_saude",
    "MEDICINA VETERINÁRIA": "ciencias_saude",
    "NUTRIÇÃO": "ciencias_saude",
    "ODONTOLOGIA": "ciencias_saude",
    "SAÚDE COLETIVA": "ciencias_saude",
    # Ciências Agrárias
    "AGRONOMIA": "ciencias_agrarias",
    "CIÊNCIA E TECNOLOGIA DE ALIMENTOS": "ciencias_agrarias",
    "RECURSOS FLORESTAIS": "ciencias_agrarias",
    "RECURSOS PESQUEIROS": "ciencias_agrarias",
    "ZOOTECNIA": "ciencias_agrarias",
    # Ciências Sociais Aplicadas
    "ADMINISTRAÇÃO": "ciencias_sociais_aplicadas",
    "ARQUITETURA E URBANISMO": "ciencias_sociais_aplicadas",
    "CIÊNCIA DA INFORMAÇÃO": "ciencias_sociais_aplicadas",
    "CIÊNCIAS CONTÁBEIS": "ciencias_sociais_aplicadas",
    "COMUNICAÇÃO": "ciencias_sociais_aplicadas",
    "DEMOGRAFIA": "ciencias_sociais_aplicadas",
    "DIREITO": "ciencias_sociais_aplicadas",
    "ECONOMIA": "ciencias_sociais_aplicadas",
    "PLANEJAMENTO URBANO": "ciencias_sociais_aplicadas",
    "SERVIÇO SOCIAL": "ciencias_sociais_aplicadas",
    "TURISMO": "ciencias_sociais_aplicadas",
    # Ciências Humanas
    "ANTROPOLOGIA": "ciencias_humanas",
    "ARQUEOLOGIA": "ciencias_humanas",
    "CIÊNCIA POLÍTICA": "ciencias_humanas",
    "EDUCAÇÃO": "ciencias_humanas",
    "FILOSOFIA": "ciencias_humanas",
    "GEOGRAFIA": "ciencias_humanas",
    "HISTÓRIA": "ciencias_humanas",
    "PSICOLOGIA": "ciencias_humanas",
    "SOCIOLOGIA": "ciencias_humanas",
    "TEOLOGIA": "ciencias_humanas",
    # Linguística, Letras e Artes
    "ARTES": "linguistica_letras_artes",
    "LETRAS": "linguistica_letras_artes",
    "LINGUÍSTICA": "linguistica_letras_artes",
    "MÚSICA": "linguistica_letras_artes",
    # Multidisciplinar
    "BIOTECNOLOGIA": "multidisciplinar",
    "CIÊNCIAS AMBIENTAIS": "multidisciplinar",
    "ENSINO": "multidisciplinar",
    "INTERDISCIPLINAR": "multidisciplinar",
}

# Mapeamento nível CAPES → nosso sistema
NIVEL_MAP: dict[str, str] = {
    "MESTRADO": "mestrado",
    "MESTRADO ACADÊMICO": "mestrado",
    "DOUTORADO": "doutorado",
    "MESTRADO PROFISSIONAL": "mestrado_profissional",
    "DOUTORADO PROFISSIONAL": "doutorado",
}

# Siglas de estado válidas
ESTADOS_VALIDOS = {
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
    "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
    "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
}


def normalizar_nivel(nivel_raw: str) -> str:
    """Normaliza string de nível para nosso padrão."""
    upper = nivel_raw.upper().strip()
    for key, val in NIVEL_MAP.items():
        if key in upper:
            return val
    return "mestrado"


def normalizar_grande_area(area_raw: str) -> str:
    """Mapeia área CAPES para grande_area do nosso sistema."""
    upper = area_raw.upper().strip()
    # Busca exata
    if upper in AREA_PARA_GRANDE_AREA:
        return AREA_PARA_GRANDE_AREA[upper]
    # Busca parcial
    for key, val in AREA_PARA_GRANDE_AREA.items():
        if key in upper or upper in key:
            return val
    return "multidisciplinar"


def salvar_json(dados: list[dict[str, Any]], caminho: Path, logger: logging.Logger) -> None:
    """Salva lista de dicionários em JSON com formatação."""
    import json
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    logger.info(f"Salvo: {caminho} ({len(dados)} registros)")
