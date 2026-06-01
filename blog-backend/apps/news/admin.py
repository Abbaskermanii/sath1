from django.contrib import admin
from .models import Category, Tag, Post, Comment, Bookmark


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug", "created_at")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug", "created_at")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "author",
        "status",
        "category",
        "published_at",
        "created_at",
    )
    list_filter = ("status", "category", "created_at")
    search_fields = ("title", "slug", "author__username", "author__email")
    autocomplete_fields = ("author", "category", "tags")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "created_at"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "user", "is_approved", "created_at")
    list_filter = ("is_approved", "created_at")
    search_fields = ("post__title", "user__username", "user__email", "text")
    autocomplete_fields = ("post", "user")
    actions = ["approve_comments", "reject_comments"]

    @admin.action(description="Approve selected comments")
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)

    @admin.action(description="Reject selected comments")
    def reject_comments(self, request, queryset):
        queryset.update(is_approved=False)


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "user", "created_at")
    search_fields = ("post__title", "user__username", "user__email")
    autocomplete_fields = ("post", "user")
