import requests
from django.conf import settings
from decimal import Decimal
from django.db import transaction
from apps.market.models import MarketItem


def fetch_nerkh_prices():
    response = requests.get(
        settings.NERKH_API_URL,
        headers={
            "Authorization": f"Bearer {settings.NERKH_API_TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "django-market-service",
        },
        timeout=20,
    )

    response.raise_for_status()
    return response.json()


@transaction.atomic
def build_market_items_from_nerkh():
    response = fetch_nerkh_prices()
    data = response.get("data", {})

    sections = ["currency", "gold", "crypto"]

    for section in sections:
        section_data = data.get(section, {})

        for symbol, info in section_data.items():
            price = info.get("current")
            if not price:
                continue

            MarketItem.objects.update_or_create(
                symbol=symbol,
                defaults={
                    "title": symbol,
                    "subtitle": section,
                    "value": Decimal(price),
                    "source": "nerkh",
                    "raw_symbol": symbol,
                },
            )

    return MarketItem.objects.count()
