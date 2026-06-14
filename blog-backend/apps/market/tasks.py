from celery import shared_task
from .services import build_market_items_from_nerkh


@shared_task
def fetch_iran_market_data():
    return build_market_items_from_nerkh()
