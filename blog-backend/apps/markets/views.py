from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from apps.markets.models import MarketPrice
from apps.markets.serializers import MarketPriceSerializer


class MarketPriceListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MarketPriceSerializer
    queryset = MarketPrice.objects.all().order_by("sort_order", "id")
    pagination_class = None
