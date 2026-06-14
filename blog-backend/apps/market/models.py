from django.db import models


class MarketItem(models.Model):
    symbol = models.CharField(max_length=32, unique=True)
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=50, default="تومان")
    value = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    active = models.BooleanField(default=False)
    type = models.CharField(max_length=50, default="currency")
    raw_symbol = models.CharField(max_length=50, blank=True)
    source = models.CharField(max_length=50, default="fastforex")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.symbol} - {self.value}"
