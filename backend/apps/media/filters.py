import django_filters
from django.db.models import Q

from .models import Video


class VideoFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug", lookup_expr="iexact")
    tag = django_filters.CharFilter(field_name="tags__slug", lookup_expr="iexact")
    author = django_filters.CharFilter(field_name="author__username", lookup_expr="iexact")
    author_id = django_filters.NumberFilter(field_name="author_id")
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")

    published_from = django_filters.IsoDateTimeFilter(field_name="published_at", lookup_expr="gte")
    published_to = django_filters.IsoDateTimeFilter(field_name="published_at", lookup_expr="lte")

    categories = django_filters.CharFilter(method="filter_categories")
    tags = django_filters.CharFilter(method="filter_tags")
    q = django_filters.CharFilter(method="filter_q")

    class Meta:
        model = Video
        fields = [
            "category",
            "tag",
            "author",
            "author_id",
            "status",
            "is_featured",
            "published_from",
            "published_to",
            "categories",
            "tags",
            "q",
        ]

    def _split_csv(self, value):
        if not value:
            return []
        return [item.strip() for item in value.split(",") if item.strip()]

    def filter_categories(self, queryset, name, value):
        values = self._split_csv(value)
        if not values:
            return queryset
        return queryset.filter(category__slug__in=values).distinct()

    def filter_tags(self, queryset, name, value):
        values = self._split_csv(value)
        if not values:
            return queryset
        return queryset.filter(tags__slug__in=values).distinct()

    def filter_q(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(title__icontains=value)
            | Q(summary__icontains=value)
            | Q(description__icontains=value)
            | Q(slug__icontains=value)
            | Q(author__username__icontains=value)
            | Q(category__name__icontains=value)
            | Q(tags__name__icontains=value)
        ).distinct()
