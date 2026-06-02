import django_filters

from apps.news.models import Post


class PostFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    tag = django_filters.CharFilter(field_name="tags__slug")
    post_type = django_filters.CharFilter(field_name="post_type")

    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    is_hero = django_filters.BooleanFilter(field_name="is_hero")
    show_on_homepage = django_filters.BooleanFilter(field_name="show_on_homepage")
    homepage_section = django_filters.CharFilter(field_name="homepage_section")

    author = django_filters.NumberFilter(field_name="author__id")

    published_after = django_filters.DateTimeFilter(
        field_name="published_at",
        lookup_expr="gte",
    )
    published_before = django_filters.DateTimeFilter(
        field_name="published_at",
        lookup_expr="lte",
    )

    class Meta:
        model = Post
        fields = [
            "category",
            "tag",
            "post_type",
            "is_featured",
            "is_hero",
            "show_on_homepage",
            "homepage_section",
            "author",
            "published_after",
            "published_before",
        ]
