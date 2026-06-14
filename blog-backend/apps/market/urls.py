from django.urls import path

from .views import GoldChartAPIView, MarketItemsAPIView

urlpatterns = [
    path("", MarketItemsAPIView.as_view(), name="market-items"),
]
