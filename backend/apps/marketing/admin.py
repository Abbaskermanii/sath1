from django.contrib import admin
from .models import Advertisement


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "position", "is_active", "order", "start_at", "end_at"]
    list_editable = ["is_active", "order"]
    list_filter = ["position", "is_active"]
    search_fields = ["title", "text"]
