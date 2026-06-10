from django.core.management.base import BaseCommand

from apps.markets.tasks import sync_market_prices_task


class Command(BaseCommand):
    help = "Sync market prices from Alpha Vantage"

    def handle(self, *args, **options):
        result = sync_market_prices_task()

        self.stdout.write(
            self.style.SUCCESS(
                f"{result['synced']} market prices synced successfully."
            )
        )
