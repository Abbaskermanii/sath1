import django_filters

from apps.media.models import Video, Podcast


class VideoFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    tag = django_filters.CharFilter(field_name="tags__slug")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")

    published_after = django_filters.DateTimeFilter(
        field_name="published_at",
        lookup_expr="gte",
    )
    published_before = django_filters.DateTimeFilter(
        field_name="published_at",
        lookup_expr="lte",
    )

    class Meta:
        model = Video
        fields = [
            "category",
            "tag",
            "is_featured",
            "published_after",
            "published_before",
        ]


class PodcastFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    tag = django_filters.CharFilter(field_name="tags__slug")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")

    published_after = django_filters.DateTimeFilter(
        field_name="published_at",
        lookup_expr="gte",
    )
    published_before = django_filters.DateTimeFilter(
        field_name="published_at",
        lookup_expr="lte",
    )

    class Meta:
        model = Podcast
        fields = [
            "category",
            "tag",
            "is_featured",
            "published_after",
            "published_before",
        ]
