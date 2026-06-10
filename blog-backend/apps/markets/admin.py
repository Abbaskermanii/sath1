from django.contrib import admin
from apps.markets.models import MarketSymbol, MarketPrice


@admin.register(MarketSymbol)
class MarketSymbolAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "symbol",
        "type",
        "from_currency",
        "to_currency",
        "target_currency",
        "enabled_for_sync",
        "active",
        "sort_order",
    )
    list_filter = ("type", "target_currency", "enabled_for_sync", "active")
    search_fields = ("title", "symbol", "from_currency", "to_currency")
    ordering = ("sort_order", "id")


@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "symbol",
        "type",
        "display_value",
        "active",
        "fetched_at",
        "sort_order",
    )
    list_filter = ("type", "active", "source")
    search_fields = ("title", "symbol", "subtitle")
    ordering = ("sort_order", "id")
