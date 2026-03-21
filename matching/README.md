# PosGrad Tracker — Matching Engine

Script Python que cruza perfis de usuário com editais coletados pelo scraper (Story 1.2) e retorna uma lista ranqueada por relevância.

## Pré-requisitos

- Python 3.11+
- JSONs gerados pelo scraper em `data/` (rode `python3 -m scrapers.main all` antes)

## Como usar

### Perfil simples

```bash
python matching/run.py \
  --grandes_areas "ciencias_humanas" \
  --estados "SP,RJ" \
  --niveis "mestrado"
```

### Múltiplas áreas + EaD

```bash
python matching/run.py \
  --grandes_areas "engenharias,ciencias_exatas" \
  --estados "MG" \
  --niveis "mestrado,doutorado" \
  --aceita_ead
```

### Rodar todos os perfis de teste

```bash
python matching/run.py --test-all
```

### Salvar resultado em JSON

```bash
python matching/run.py \
  --grandes_areas "ciencias_saude" \
  --estados "SP" \
  --niveis "mestrado" \
  --output resultado.json
```

### Output JSON puro (para pipes)

```bash
python matching/run.py --grandes_areas "engenharias" --json | jq '.[0]'
```

## Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `--grandes_areas` | string | Áreas separadas por vírgula. Vazio = aceita qualquer |
| `--estados` | string | Siglas separadas por vírgula. Vazio = aceita qualquer estado |
| `--niveis` | string | Níveis separados por vírgula. Vazio = aceita qualquer |
| `--aceita_ead` | flag | Inclui editais EaD |
| `--top` | int | Máximo de resultados (default: 20) |
| `--output` | string | Salvar resultado em arquivo JSON |
| `--json` | flag | Saída JSON pura, sem texto extra |
| `--test-all` | flag | Roda todos os 5 perfis de `test_profiles.json` |

## Grandes Áreas disponíveis

| Valor | Descrição |
|-------|-----------|
| `ciencias_exatas` | Física, Matemática, Química, Computação, Estatística |
| `engenharias` | Todas as modalidades de Engenharia |
| `ciencias_biologicas` | Biologia, Bioquímica, Genética, Ecologia |
| `ciencias_saude` | Medicina, Saúde Coletiva, Enfermagem, Farmácia |
| `ciencias_agrarias` | Agronomia, Veterinária, Zootecnia |
| `ciencias_humanas` | Psicologia, Filosofia, História, Educação |
| `ciencias_sociais_aplicadas` | Direito, Administração, Economia, Comunicação |
| `linguistica_letras` | Letras, Linguística, Literatura |
| `artes` | Arte, Música, Cinema, Design |

## Algoritmo de Score

O score máximo possível é **100 pontos**, composto por 4 dimensões:

```
score = área(40) + estado(30) + nível(20) + modalidade(10)
```

### Área — 40 pts

| Condição | Pts |
|----------|-----|
| Grande área do edital bate com a do perfil | 40 |
| Perfil sem preferência de área (aceita tudo) | 40 |
| Área não inferida OU não coincide | 0 |

A área é inferida por palavras-chave no título e descrição do edital. Ex: "Engenharia Civil" → `engenharias`.

### Estado — 30 pts

| Condição | Pts |
|----------|-----|
| Estado do edital está na lista do perfil | 30 |
| Perfil sem restrição de estado | 30 |
| Edital federal/sem estado (ex: DOU) | 15 |
| Estado do edital não está na lista do perfil | 0 |

Editais do DOU recebem 15 pts de estado parcial (são federais e potencialmente aplicáveis a qualquer estado).

### Nível — 20 pts

| Condição | Pts |
|----------|-----|
| Nível do edital bate com o do perfil | 20 |
| Perfil sem preferência de nível | 20 |
| Nível não inferido no edital | 10 |
| Nível do edital não coincide com o perfil | 0 |

Níveis suportados: `mestrado`, `mestrado_profissional`, `doutorado`.

### Modalidade — 10 pts

| Condição | Pts |
|----------|-----|
| Edital presencial (qualquer perfil) | 10 |
| Edital EaD + perfil aceita EaD | 10 |
| Edital EaD + perfil **não** aceita EaD | 0 |

### Regras de exclusão

- **Score = 0** → edital não aparece no resultado (AC7)
- **Prazo vencido** (prazo < hoje) → edital excluído (AC6)
- **Mesmo edital** duplicado → deduplicado por ID (AC5)

## Formato do Output

```json
[
  {
    "edital_id": "ies_ufsc_a1b2c3d4e5f6",
    "programa_nome": "Programa de Pós-Graduação em Física",
    "ies_nome": "Universidade Federal de Santa Catarina",
    "estado": "SC",
    "nivel": "doutorado",
    "prazo_inscricao": "2026-06-18",
    "link_edital": "https://propg.ufsc.br/editais/...",
    "score": 100
  }
]
```

## Fontes de dados

| Arquivo | Registros | Descrição |
|---------|-----------|-----------|
| `data/programas.json` | 1200+ | Programas CAPES Sucupira (indexação) |
| `data/editais_dou.json` | 10+ | Editais do Diário Oficial da União |
| `data/editais_ies.json` | 20+ | Editais das Top 20 IES |
