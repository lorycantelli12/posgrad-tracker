# PosGrad Tracker — Scraper Local

Pipeline de coleta de dados em Python para a Story 1.2.

## Pré-requisitos

- Python 3.11+
- pip

## Instalação

```bash
pip install -r requirements.txt
playwright install chromium
```

## Como rodar

### Tudo (recomendado)
```bash
python -m scrapers.main all
```

### Só editais (DOU + IES) — mais rápido
```bash
python -m scrapers.main editais
```

### Só programas CAPES
```bash
python -m scrapers.main programas
```

### Scrapers individuais
```bash
python -m scrapers.capes_sucupira
python -m scrapers.dou_federal
python -m scrapers.ies_editais
```

## Arquivos gerados

| Arquivo | Descrição | Mínimo |
|---------|-----------|--------|
| `data/programas.json` | Programas CAPES Sucupira | 500+ |
| `data/editais_dou.json` | Editais do DOU Federal | 10+ |
| `data/editais_ies.json` | Editais das Top 20 IES | 20+ |

> Esses arquivos estão no `.gitignore` — não são versionados.

## Logs

```bash
tail -f logs/scraper.log
```

## Estratégia de fallback

Cada scraper tem 3 camadas de resiliência:

1. **API REST** — fonte primária (dados abertos, API pública)
2. **Playwright** — scraping com browser headless quando API falha
3. **Mock estruturado** — dados realistas gerados localmente, garante os mínimos dos ACs

O pipeline **nunca quebra** — se uma fonte falhar, continua nas demais e loga o erro.

## Schema dos JSONs

### `programas.json`
```json
{
  "id": "capes_001",
  "codigo_capes": "001",
  "nome": "Programa de Pós-Graduação em Física",
  "grande_area": "ciencias_exatas",
  "area_capes": "Física",
  "nivel": "mestrado",
  "ies_nome": "Universidade de São Paulo",
  "ies_sigla": "USP",
  "estado": "SP",
  "nota_capes": "7"
}
```

### `editais_dou.json` e `editais_ies.json`
```json
{
  "id": "dou_abc123",
  "titulo": "Edital n.º 01/2026 — Processo Seletivo PPG",
  "descricao": "...",
  "link_edital": "https://...",
  "data_publicacao": "2026-03-20",
  "fonte": "dou"
}
```

## Rate limiting

- **Entre requests do mesmo domínio:** ≥ 1,5s
- **Entre IES diferentes:** ≥ 2s
- **Entre termos DOU:** ≥ 1s
