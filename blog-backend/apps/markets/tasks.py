from celery import shared_task

from apps.markets.models import MarketPrice
from apps.markets.services.alpha_vantage import get_market_prices_from_alpha_vantage


@shared_task
def sync_market_prices_task():
    items = get_market_prices_from_alpha_vantage()

    MarketPrice.objects.all().delete()

    MarketPrice.objects.bulk_create(
        [
            MarketPrice(
                symbol=item["symbol"],
                title=item["title"],
                subtitle=item["subtitle"],
                type=item["type"],
                value=item["value"],
                display_value=item["display_value"],
                active=item["active"],
                sort_order=item["sort_order"],
                source=item["source"],
                raw_data=item["raw_data"],
                fetched_at=item["fetched_at"],
            )
            for item in items
        ]
    )

    return {"synced": len(items)}
