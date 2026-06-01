from django.contrib import admin
from .models import Podcast, PodcastComment, PodcastLike, PodcastBookmark


@admin.register(Podcast)
class PodcastAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "author",
        "category",
        "status",
        "is_featured",
        "published_at",
        "created_at",
    )
    list_filter = ("status", "is_featured", "category")
    search_fields = ("title", "slug", "summary", "description")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(PodcastComment)
class PodcastCommentAdmin(admin.ModelAdmin):
    list_display = ("id", "podcast", "user", "parent", "is_approved", "created_at")
    list_filter = ("is_approved",)
    search_fields = ("content",)


@admin.register(PodcastLike)
class PodcastLikeAdmin(admin.ModelAdmin):
    list_display = ("id", "podcast", "user", "created_at")


@admin.register(PodcastBookmark)
class PodcastBookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "podcast", "user", "created_at")
