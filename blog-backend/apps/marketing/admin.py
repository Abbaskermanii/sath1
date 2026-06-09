from django.contrib import admin
from .models import Advertisement


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slot", "is_active")
    list_filter = ("is_active", "slot")
    search_fields = ("title", "description", "label", "href")
    ordering = ("-id",)
