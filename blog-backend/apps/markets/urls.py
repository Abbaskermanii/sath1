from django.urls import path
from apps.markets.views import MarketPriceListView

urlpatterns = [
    path("", MarketPriceListView.as_view(), name="market-price-list"),
]
