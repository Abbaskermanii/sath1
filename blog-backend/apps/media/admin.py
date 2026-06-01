from django.contrib import admin
from .models import MediaFile, Video, Podcast


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "file_type", "uploaded_by", "created_at")
    list_filter = ("file_type", "created_at")
    search_fields = ("title", "alt_text", "mime_type")
    readonly_fields = ("created_at", "updated_at", "file_size", "mime_type")


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "category",
        "author",
        "status",
        "is_featured",
        "views_count",
        "published_at",
    )
    list_filter = ("status", "is_featured", "category", "published_at", "created_at")
    search_fields = ("title", "summary", "content", "slug")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    readonly_fields = ("views_count", "created_at", "updated_at")


@admin.register(Podcast)
class PodcastAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "category",
        "author",
        "status",
        "is_featured",
        "listens_count",
        "published_at",
    )
    list_filter = ("status", "is_featured", "category", "published_at", "created_at")
    search_fields = ("title", "summary", "content", "slug")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    readonly_fields = ("listens_count", "created_at", "updated_at")
