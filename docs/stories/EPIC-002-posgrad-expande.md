# EPIC-002: Expansão — Pós-Doutorado, Internacional e Produção

**Epic ID:** EPIC-002
**Status:** Active
**Owner:** @pm
**Squad:** posgrad-tracker
**Criado em:** 2026-03-21
**Depende de:** EPIC-001 (Done)

---

## Descrição

Expandir o PosGrad Tracker além do MVP de mestrado/doutorado doméstico, cobrindo **pós-doutorado no Brasil**, **bolsas internacionais reais** e **configuração de produção completa** para ativar o app com usuários reais.

## Problema que Resolve

O Epic 1 entregou toda a infraestrutura técnica mas com três lacunas críticas:

1. **Pós-doutorado** foi adicionado aos tipos mas não tem scrapers dedicados — CAPES Sucupira não indexa pós-doc como nível de programa, exigindo fontes alternativas
2. **Internacional** usa mock data — as fontes reais (Fulbright, DAAD, CNPq exterior) ainda não foram integradas de verdade
3. **Produção** nunca foi configurada — Supabase, OneSignal e Resend têm código mas sem credenciais reais, o app não notifica ninguém

## Solução

| Story | Entrega |
|-------|---------|
| 2.1 | Scrapers específicos pós-doc (CAPES bolsas, IES, DOU) |
| 2.2 | Scrapers internacionais reais (Fulbright, DAAD, CNPq exterior, CAPES) |
| 2.3 | Configuração de produção (Supabase live + OneSignal + Resend + cron) |
| 2.4 | Alpha launch (50 primeiros usuários + tracking + feedback loop) |

## Stories

| Story | Título | Status |
|-------|--------|--------|
| [2.1](stories/2.1.story.md) | Scrapers Pós-Doutorado Nacional | Draft |
| [2.2](stories/2.2.story.md) | Scrapers Internacionais Reais | Draft |
| [2.3](stories/2.3.story.md) | Configuração de Produção | Draft |
| [2.4](stories/2.4.story.md) | Alpha Launch | Draft |

## Critérios de Sucesso do Epic

- [ ] Pós-doc: 30+ editais de pós-doutorado indexados por rodada de scraping
- [ ] Internacional: 10+ bolsas reais coletadas (sem mock) por rodada
- [ ] Produção: push notification chegando no celular real em < 30min após edital
- [ ] Alpha: 50 usuários cadastrados com preferências e subscription push ativa
- [ ] Feedback: NPS ≥ 7 entre alpha users após 2 semanas

## Fora do Escopo

- Integração Lattes
- Recomendação de orientadores
- App nativo iOS/Android
- Busca manual por texto
- Notificação de resultado de processo seletivo
