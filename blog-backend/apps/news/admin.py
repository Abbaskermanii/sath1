from django.contrib import admin

from apps.news.models import Category, Tag, Post, Comment, Bookmark


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
        "category",
        "post_type",
        "status",
        "is_hero",
        "is_featured",
        "show_on_homepage",
        "homepage_section",
        "homepage_order",
        "published_at",
        "views",
    )

    list_filter = (
        "status",
        "post_type",
        "category",
        "is_hero",
        "is_featured",
        "show_on_homepage",
        "homepage_section",
        "published_at",
    )

    search_fields = ("title", "slug", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)

    ordering = ("-published_at", "-created_at")

    fieldsets = (
        (
            "Main",
            {
                "fields": (
                    "author",
                    "title",
                    "slug",
                    "excerpt",
                    "content",
                    "cover",
                    "category",
                    "tags",
                    "post_type",
                    "status",
                    "published_at",
                )
            },
        ),
        (
            "Homepage / Layout",
            {
                "fields": (
                    "is_hero",
                    "is_featured",
                    "show_on_homepage",
                    "homepage_section",
                    "homepage_order",
                )
            },
        ),
        (
            "Stats",
            {
                "fields": ("views",),
            },
        ),
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "user", "is_approved", "created_at")
    list_filter = ("is_approved", "created_at")
    search_fields = ("text",)


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "user", "created_at")
    search_fields = ("post__title", "user__email")
