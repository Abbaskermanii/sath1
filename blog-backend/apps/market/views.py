from rest_framework.views import APIView
from rest_framework.response import Response

from .models import MarketItem


def format_toman(value):
    if value is None:
        return "—"

    return f"{value:,.0f}"


class MarketItemsAPIView(APIView):
    def get(self, request):
        items = MarketItem.objects.all().order_by("id")

        data = [
            {
                "id": item.id,
                "symbol": item.symbol,
                "title": item.title,
                "subtitle": item.subtitle,
                "value": format_toman(item.value),
                "active": item.active,
                "type": item.type,
                "rawSymbol": item.raw_symbol,
                "source": item.source,
                "updatedAt": item.updated_at,
            }
            for item in items
        ]

        return Response(data)


class GoldChartAPIView(APIView):
    def get(self, request):
        return Response([])
