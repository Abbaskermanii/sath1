from django.contrib import admin
from .models import Category, Tag, Post, Comment, Bookmark, Notification


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "slug", "headline_post", "is_active", "order"]
    list_editable = ["is_active", "order"]
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ["title", "slug"]


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "slug", "is_hot", "show_in_home", "home_order"]
    list_editable = ["is_hot", "show_in_home", "home_order"]
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ["title", "slug"]


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "title",
        "author",
        "category",
        "status",
        "is_featured",
        "is_hot",
        "is_breaking",
        "show_in_home",
        "view",
        "published_at",
        "created_at",
    ]
    list_filter = ["status", "category", "is_featured", "is_hot", "is_breaking"]
    search_fields = ["title", "description", "excerpt"]
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ["tags", "likes"]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["id", "post", "name", "email", "is_approved", "created_at"]
    list_filter = ["is_approved"]
    search_fields = ["name", "email", "comment"]


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "post", "created_at"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "post", "type", "seen", "created_at"]
    list_filter = ["type", "seen"]
