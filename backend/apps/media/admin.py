from django.contrib import admin
from .models import Video, Podcast


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "title",
        "author",
        "category",
        "status",
        "is_suggested",
        "is_featured",
        "show_in_home",
        "views",
        "published_at",
    ]
    list_filter = ["status", "category", "is_suggested", "is_featured", "show_in_home"]
    search_fields = ["title", "description", "excerpt"]
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ["tags"]


@admin.register(Podcast)
class PodcastAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "title",
        "author",
        "status",
        "is_suggested",
        "is_featured",
        "show_in_home",
        "listens",
        "published_at",
    ]
    list_filter = ["status", "is_suggested", "is_featured", "show_in_home"]
    search_fields = ["title", "description", "excerpt"]
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ["tags"]
