# EPIC-001: PosGrad Tracker

**Epic ID:** EPIC-001
**Status:** Active
**Owner:** @pm
**Squad:** posgrad-tracker
**Criado em:** 2026-03-20

---

## Descrição

Desenvolver o **PosGrad Tracker** — aplicativo que monitora processos seletivos de mestrado e doutorado no Brasil e notifica usuários quando um edital relevante abre na sua área e estado de interesse.

## Problema que Resolve

Candidatos a pós-graduação perdem prazos de inscrição porque não têm como monitorar os ~7.000 programas cadastrados na CAPES e os editais publicados em dezenas de sites de universidades, no DOU e no Sucupira.

## Solução

1. Usuário informa área de interesse e estados
2. Sistema monitora CAPES Sucupira + Top 100 IES + DOU federal
3. Quando edital relevante abre → usuário recebe push notification + email

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + Tailwind + shadcn/ui (PWA) |
| Scraper | Python 3.11 + Playwright + httpx |
| Agendador | GitHub Actions (cron diário) |
| Push | OneSignal |
| Email | Resend |
| Banco | Supabase (PostgreSQL + Auth + Edge Functions) |
| Deploy | Vercel |

## Cobertura MVP

- **CAPES Sucupira** — ~7.000 programas reconhecidos
- **Top 100 IES** — por volume de programas (editais individuais)
- **DOU federal** — publicações oficiais

## Estratégia de Build

> Supabase entra por último. Validar UI, dados e matching antes de conectar o banco.

## Stories

| Story | Título | Status | Fase |
|-------|--------|--------|------|
| [1.1](stories/1.1.story.md) | Frontend com Dados Mock | Draft | 1 |
| [1.2](stories/1.2.story.md) | Scraper Local (CAPES + DOU + IES) | Draft | 2 |
| [1.3](stories/1.3.story.md) | Matching Local | Draft | 3 |
| [1.4](stories/1.4.story.md) | Notificações com OneSignal | Draft | 4 |
| [1.5](stories/1.5.story.md) | Integração Supabase | Draft | 5 |
| [1.6](stories/1.6.story.md) | Polish e Launch | Draft | 6 |

## Critérios de Sucesso do Epic

- [ ] Scraper rodando diariamente sem intervenção manual
- [ ] 100+ editais indexados
- [ ] Push notification chegando em < 30min após edital ser publicado
- [ ] Onboarding completion rate > 60%
- [ ] 50 usuários no alpha com feedback positivo

## Fora do Escopo (v1)

- Busca manual por texto
- Notificação de resultado do processo seletivo
- Recomendação de orientadores
- Integração com Lattes
- App nativo iOS/Android (PWA é suficiente)
- Internacionalização

## Agentes do Squad

```
@posgrad-tracker:posgrad-chief  → visão geral + decisões de escopo
@posgrad-tracker:pieter-levels  → scraper (Stories 1.2 + parte 1.5)
@posgrad-tracker:daphne-koller  → matching (Stories 1.3 + parte 1.5)
@posgrad-tracker:nir-eyal       → notificações push (Stories 1.4 + 1.5)
@posgrad-tracker:samuel-hulick  → onboarding UX (Story 1.1)
@posgrad-tracker:patrick-mckenzie → lifecycle emails (Story 1.5)
```
