from rest_framework import serializers
from apps.markets.models import MarketPrice


class MarketPriceSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source="display_value", read_only=True)

    class Meta:
        model = MarketPrice
        fields = [
            "id",
            "symbol",
            "title",
            "subtitle",
            "type",
            "value",
            "active",
            "sort_order",
            "source",
            "fetched_at",
        ]
