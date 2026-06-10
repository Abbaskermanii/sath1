import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("blog_backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "sync-market-prices-hourly": {
        "task": "apps.markets.tasks.sync_market_prices_task",
        "schedule": crontab(minute=0),
    },
}
