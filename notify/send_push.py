"""
PosGrad Tracker — Disparo manual de Push Notifications via OneSignal.

Uso:
  python notify/send_push.py --template match     --external_id user_001 --edital_id abc123
  python notify/send_push.py --template deadline  --external_id user_001 --edital_id abc123 --programa "Física USP"
  python notify/send_push.py --template digest    --external_id user_001 --count 5
  python notify/send_push.py --test-all           # dispara os 3 templates para o usuário de teste
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

import httpx
from dotenv import load_dotenv

# Carrega .env.local (root do projeto)
ROOT = Path(__file__).parent.parent
load_dotenv(ROOT / ".env.local")

ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications"
APP_ID = os.getenv("ONESIGNAL_APP_ID")
API_KEY = os.getenv("ONESIGNAL_REST_API_KEY")
BASE_URL = os.getenv("NEXT_PUBLIC_BASE_URL", "http://localhost:3000")
TEST_EXTERNAL_ID = "posgrad_test_user_001"

# ---------------------------------------------------------------------------
# Templates de push (AC9)
# ---------------------------------------------------------------------------

def template_match_novo(
    edital_id: str,
    programa_nome: str = "Mestrado em Ciência da Computação",
    ies_nome: str = "USP",
    estado: str = "SP",
    prazo: str | None = None,
) -> dict:
    """
    Template 1 — Match Novo:
    Título: 🎓 {programa_nome}
    Corpo:  {ies_nome} · {estado} · até {prazo}
    URL:    /editais/{edital_id}
    """
    if prazo is None:
        prazo = (datetime.now() + timedelta(days=30)).strftime("%d/%m/%Y")

    return {
        "headings": {"pt": f"🎓 {programa_nome}", "en": f"🎓 {programa_nome}"},
        "contents": {
            "pt": f"{ies_nome} · {estado} · até {prazo}",
            "en": f"{ies_nome} · {estado} · until {prazo}",
        },
        "url": f"{BASE_URL}/editais/{edital_id}",
    }


def template_deadline(
    edital_id: str,
    programa_nome: str = "Mestrado em Física",
    dias: int = 7,
) -> dict:
    """
    Template 2 — Deadline N dias:
    Título: ⏰ Prazo se encerrando
    Corpo:  {programa_nome} — inscrições encerram em {N} dias
    URL:    /editais/{edital_id}
    """
    corpo = (
        f"{programa_nome} — inscrições encerram em {dias} dia"
        + ("s" if dias != 1 else "")
    )
    return {
        "headings": {"pt": "⏰ Prazo se encerrando", "en": "⏰ Deadline approaching"},
        "contents": {"pt": corpo, "en": corpo},
        "url": f"{BASE_URL}/editais/{edital_id}",
    }


def template_digest(count: int = 5) -> dict:
    """
    Template 3 — Digest semanal:
    Título: 📋 {N} editais abertos esta semana
    Corpo:  Na sua área de interesse
    URL:    /dashboard
    """
    return {
        "headings": {
            "pt": f"📋 {count} editais abertos esta semana",
            "en": f"📋 {count} open positions this week",
        },
        "contents": {
            "pt": "Na sua área de interesse",
            "en": "In your area of interest",
        },
        "url": f"{BASE_URL}/dashboard",
    }


# ---------------------------------------------------------------------------
# Envio via OneSignal API
# ---------------------------------------------------------------------------

def enviar_push(external_id: str, payload: dict) -> dict:
    """Envia push para um usuário específico via external_id."""
    if not APP_ID or not API_KEY:
        print("⚠  Credenciais OneSignal não configuradas — modo simulação", file=sys.stderr)
        print(f"\nPayload que seria enviado:")
        print(json.dumps({"app_id": "<APP_ID>", "external_id": external_id, **payload}, ensure_ascii=False, indent=2))
        return {"simulated": True}

    body = {
        "app_id": APP_ID,
        "filters": [
            {"field": "external_id", "value": external_id},
        ],
        **payload,
    }

    headers = {
        "Authorization": f"Basic {API_KEY}",
        "Content-Type": "application/json",
    }

    with httpx.Client(timeout=15) as client:
        r = client.post(ONESIGNAL_API_URL, json=body, headers=headers)

    result = r.json()
    if r.status_code == 200 and result.get("id"):
        print(f"✓ Push enviado | ID: {result['id']} | Destinatários: {result.get('recipients', '?')}")
    else:
        print(f"✗ Falha ao enviar push: {result}", file=sys.stderr)
    return result


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="PosGrad Tracker — Disparo manual de push notifications",
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=(
            "Exemplos:\n"
            '  python notify/send_push.py --template match --external_id user_001 --edital_id abc123\n'
            '  python notify/send_push.py --template deadline --external_id user_001 --edital_id abc123 --programa "Física USP"\n'
            '  python notify/send_push.py --template digest --external_id user_001 --count 5\n'
            "  python notify/send_push.py --test-all"
        ),
    )
    parser.add_argument(
        "--template",
        choices=["match", "deadline", "digest"],
        help="Template de push a enviar",
    )
    parser.add_argument(
        "--external_id",
        type=str,
        default=TEST_EXTERNAL_ID,
        help=f"external_id do usuário (default: {TEST_EXTERNAL_ID})",
    )
    parser.add_argument(
        "--edital_id",
        type=str,
        default="dou_mock_001",
        help="ID do edital para deep link",
    )
    parser.add_argument(
        "--programa",
        type=str,
        default="Mestrado em Ciência da Computação",
        help="Nome do programa (para templates match/deadline)",
    )
    parser.add_argument(
        "--ies",
        type=str,
        default="USP",
        help="Sigla da IES (para template match)",
    )
    parser.add_argument(
        "--estado",
        type=str,
        default="SP",
        help="Estado UF (para template match)",
    )
    parser.add_argument(
        "--prazo",
        type=str,
        default=None,
        help="Prazo de inscrição (DD/MM/YYYY). Default: hoje + 30 dias",
    )
    parser.add_argument(
        "--dias",
        type=int,
        default=7,
        help="Dias para encerramento (para template deadline)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=5,
        help="Número de editais (para template digest)",
    )
    parser.add_argument(
        "--test-all",
        action="store_true",
        default=False,
        help=f"Dispara os 3 templates para o usuário de teste ({TEST_EXTERNAL_ID})",
    )

    args = parser.parse_args()

    if args.test_all:
        print("=" * 55)
        print("PosGrad Tracker — Teste de todos os templates de push")
        print("=" * 55)
        print(f"Usuário: {TEST_EXTERNAL_ID}")
        print()

        print("── Template 1: Match Novo ──────────────────────────")
        payload = template_match_novo(
            edital_id="dou_mock_001",
            programa_nome="Mestrado em Ciência da Computação",
            ies_nome="UFMG",
            estado="MG",
            prazo="19/04/2026",
        )
        enviar_push(TEST_EXTERNAL_ID, payload)
        print()

        print("── Template 2: Deadline 7 dias ─────────────────────")
        payload = template_deadline(
            edital_id="ies_ufsc_abc123",
            programa_nome="Doutorado em Física",
            dias=7,
        )
        enviar_push(TEST_EXTERNAL_ID, payload)
        print()

        print("── Template 3: Digest semanal ──────────────────────")
        payload = template_digest(count=5)
        enviar_push(TEST_EXTERNAL_ID, payload)
        print()

        print("=" * 55)
        print("✓ Todos os templates processados.")
        return

    if not args.template:
        parser.print_help()
        sys.exit(1)

    if args.template == "match":
        payload = template_match_novo(
            edital_id=args.edital_id,
            programa_nome=args.programa,
            ies_nome=args.ies,
            estado=args.estado,
            prazo=args.prazo,
        )
    elif args.template == "deadline":
        payload = template_deadline(
            edital_id=args.edital_id,
            programa_nome=args.programa,
            dias=args.dias,
        )
    else:  # digest
        payload = template_digest(count=args.count)

    print(f"Template: {args.template} → {args.external_id}")
    enviar_push(args.external_id, payload)


if __name__ == "__main__":
    main()
