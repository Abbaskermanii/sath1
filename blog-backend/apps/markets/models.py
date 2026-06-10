from django.db import models


class MarketSymbol(models.Model):
    PROVIDER_ALPHA_VANTAGE = "alpha_vantage"

    TYPE_CRYPTO = "crypto"
    TYPE_FOREX = "forex"
    TYPE_COMMODITY = "commodity"
    TYPE_INDEX = "index"

    TYPE_CHOICES = [
        (TYPE_CRYPTO, "Crypto"),
        (TYPE_FOREX, "Forex"),
        (TYPE_COMMODITY, "Commodity"),
        (TYPE_INDEX, "Index"),
    ]

    TARGET_USD = "USD"
    TARGET_IRR = "IRR"

    TARGET_CURRENCY_CHOICES = [
        (TARGET_USD, "US Dollar"),
        (TARGET_IRR, "Iranian Rial"),
    ]

    symbol = models.CharField(max_length=30, unique=True)
    from_currency = models.CharField(max_length=20, blank=True)
    to_currency = models.CharField(max_length=20, blank=True, default="USD")

    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)

    provider = models.CharField(max_length=50, default=PROVIDER_ALPHA_VANTAGE)
    provider_function = models.CharField(
        max_length=100,
        default="CURRENCY_EXCHANGE_RATE",
    )

    target_currency = models.CharField(
        max_length=10,
        choices=TARGET_CURRENCY_CHOICES,
        default=TARGET_USD,
    )

    decimal_places = models.PositiveSmallIntegerField(default=2)
    active = models.BooleanField(default=True)
    enabled_for_sync = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "Market Symbol"
        verbose_name_plural = "Market Symbols"

    def __str__(self):
        return self.title


class MarketPrice(models.Model):
    TYPE_CRYPTO = "crypto"
    TYPE_FOREX = "forex"
    TYPE_COMMODITY = "commodity"
    TYPE_INDEX = "index"

    TYPE_CHOICES = [
        (TYPE_CRYPTO, "Crypto"),
        (TYPE_FOREX, "Forex"),
        (TYPE_COMMODITY, "Commodity"),
        (TYPE_INDEX, "Index"),
    ]

    symbol = models.CharField(max_length=30, unique=True)
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)

    value = models.DecimalField(max_digits=30, decimal_places=8, null=True, blank=True)
    display_value = models.CharField(max_length=100, blank=True)

    active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    source = models.CharField(max_length=50, default="alpha_vantage")
    raw_data = models.JSONField(default=dict, blank=True)

    fetched_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "Market Price"
        verbose_name_plural = "Market Prices"

    def __str__(self):
        return f"{self.title} - {self.display_value}"
