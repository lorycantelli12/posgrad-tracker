# PosGrad Tracker — Notificações Push

Integração OneSignal para envio de push notifications no browser (Web Push).

## Pré-requisitos

1. **Conta OneSignal** — [onesignal.com](https://onesignal.com) (gratuito)
2. **App Web Push configurado** no OneSignal
3. Variáveis de ambiente configuradas (ver abaixo)

## Setup OneSignal (AC1 — ação manual)

### Passo a passo:

1. Acesse [onesignal.com](https://onesignal.com) e crie uma conta
2. Clique em **"New App/Website"**
3. Escolha **"Web Push"**
4. Configure:
   - **Site Name:** PosGrad Tracker
   - **Site URL:** `https://seu-dominio.vercel.app` (ou `http://localhost:3000` para dev)
   - **Auto Resubscribe:** Enabled
5. Copie o **App ID** (Settings → Keys & IDs)
6. Copie a **REST API Key** (Settings → Keys & IDs)

### Safari iOS:

Safari no iOS 16.4+ suporta Web Push para PWAs instaladas na tela inicial. O PosGrad Tracker já tem `public/manifest.json` configurado. Para ativar:
1. Em Settings → Keys & IDs, copie o **Safari Web ID**
2. Adicione como `NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID` no `.env.local`

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

```env
# OneSignal — push notifications
NEXT_PUBLIC_ONESIGNAL_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ONESIGNAL_API_KEY=REST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID=web.onesignal.auto.xxxxxxxx  # opcional (Safari iOS)
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # ou https://seu-dominio.vercel.app
```

## Como testar push manualmente

### 1. Iniciar o app (com credenciais configuradas)

```bash
npm run dev
```

### 2. Aceitar permissão de push

Acesse `http://localhost:3000/cadastro` → siga o onboarding → na tela de notificações, clique **"Ativar notificações"**. O browser vai exibir o popup de permissão.

### 3. Disparar push via script Python

```bash
# Template 1 — Match Novo
python notify/send_push.py \
  --template match \
  --edital_id dou_mock_001 \
  --programa "Mestrado em Ciência da Computação" \
  --ies UFMG --estado MG --prazo "19/04/2026"

# Template 2 — Deadline 7 dias
python notify/send_push.py \
  --template deadline \
  --edital_id ies_ufsc_abc123 \
  --programa "Doutorado em Física" \
  --dias 7

# Template 3 — Digest semanal
python notify/send_push.py \
  --template digest \
  --count 5

# Rodar os 3 templates de uma vez
python notify/send_push.py --test-all
```

### 4. Verificar no OneSignal Dashboard

Acesse o dashboard → **Delivery** para ver os logs de envio.

## Templates de push (AC9)

| Template | Título | Corpo | URL destino |
|----------|--------|-------|-------------|
| `match` | `🎓 {programa_nome}` | `{ies_nome} · {estado} · até {prazo}` | `/editais/{edital_id}` |
| `deadline` | `⏰ Prazo se encerrando` | `{programa_nome} — inscrições encerram em N dias` | `/editais/{edital_id}` |
| `digest` | `📋 {N} editais abertos esta semana` | `Na sua área de interesse` | `/dashboard` |

## Modo simulação (sem credenciais)

Se as credenciais não estiverem configuradas, o script exibe o payload que **seria** enviado — útil para desenvolvimento local sem OneSignal:

```
⚠  Credenciais OneSignal não configuradas — modo simulação

Payload que seria enviado:
{
  "app_id": "<APP_ID>",
  "external_id": "posgrad_test_user_001",
  "headings": { "pt": "🎓 Mestrado em Ciência da Computação" },
  ...
}
```

## external_id hardcoded (Story 1.4)

Para testes, o `external_id` padrão é `posgrad_test_user_001`. Na Story 1.5, será substituído pelo `user.id` do Supabase Auth.

## Deep links (AC7)

Clique no push abre `/editais/{edital_id}` — a página de detalhe do edital já existe (`app/editais/[id]/page.tsx`).
