from datetime import datetime, time

import django_filters
import jdatetime
from django.utils import timezone

from .models import News


class NewsFilter(django_filters.FilterSet):
    # -----------------------------
    # Single-value filters
    # -----------------------------
    category = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="iexact",
        label="Category slug",
    )

    tag = django_filters.CharFilter(
        field_name="tags__slug",
        lookup_expr="iexact",
        label="Tag slug",
    )

    author = django_filters.CharFilter(
        field_name="author__username",
        lookup_expr="iexact",
        label="Author username",
    )

    author_id = django_filters.NumberFilter(
        field_name="author__id",
        label="Author ID",
    )

    status = django_filters.CharFilter(
        field_name="status",
        lookup_expr="iexact",
        label="News status",
    )

    is_featured = django_filters.BooleanFilter(
        field_name="is_featured",
        label="Is featured",
    )

    # -----------------------------
    # Multi-value filters
    # Example:
    # ?categories=sport,politics,tech
    # ?tags=django,python,backend
    # -----------------------------
    categories = django_filters.CharFilter(
        method="filter_categories",
        label="Comma separated category slugs",
    )

    tags = django_filters.CharFilter(
        method="filter_tags",
        label="Comma separated tag slugs",
    )

    # -----------------------------
    # Gregorian datetime filters
    # Example:
    # ?published_from=2025-01-01T00:00:00
    # ?published_to=2025-01-31T23:59:59
    # -----------------------------
    published_from = django_filters.IsoDateTimeFilter(
        field_name="published_at",
        lookup_expr="gte",
        label="Published at >= ISO datetime",
    )

    published_to = django_filters.IsoDateTimeFilter(
        field_name="published_at",
        lookup_expr="lte",
        label="Published at <= ISO datetime",
    )

    created_from = django_filters.IsoDateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
        label="Created at >= ISO datetime",
    )

    created_to = django_filters.IsoDateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
        label="Created at <= ISO datetime",
    )

    updated_from = django_filters.IsoDateTimeFilter(
        field_name="updated_at",
        lookup_expr="gte",
        label="Updated at >= ISO datetime",
    )

    updated_to = django_filters.IsoDateTimeFilter(
        field_name="updated_at",
        lookup_expr="lte",
        label="Updated at <= ISO datetime",
    )

    # -----------------------------
    # Gregorian date-only filters
    # Example:
    # ?published_date_from=2025-01-01
    # ?published_date_to=2025-01-31
    # -----------------------------
    published_date_from = django_filters.DateFilter(
        field_name="published_at",
        lookup_expr="date__gte",
        label="Published date >=",
    )

    published_date_to = django_filters.DateFilter(
        field_name="published_at",
        lookup_expr="date__lte",
        label="Published date <=",
    )

    created_date_from = django_filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__gte",
        label="Created date >=",
    )

    created_date_to = django_filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__lte",
        label="Created date <=",
    )

    # -----------------------------
    # Jalali date filters
    # Example:
    # ?jalali_from=1403-10-01
    # ?jalali_to=1403-10-30
    # -----------------------------
    jalali_from = django_filters.CharFilter(
        method="filter_jalali_from",
        label="Jalali published date from (YYYY-MM-DD)",
    )

    jalali_to = django_filters.CharFilter(
        method="filter_jalali_to",
        label="Jalali published date to (YYYY-MM-DD)",
    )

    created_jalali_from = django_filters.CharFilter(
        method="filter_created_jalali_from",
        label="Jalali created date from (YYYY-MM-DD)",
    )

    created_jalali_to = django_filters.CharFilter(
        method="filter_created_jalali_to",
        label="Jalali created date to (YYYY-MM-DD)",
    )

    class Meta:
        model = News
        fields = [
            "category",
            "categories",
            "tag",
            "tags",
            "author",
            "author_id",
            "status",
            "is_featured",
            "published_from",
            "published_to",
            "created_from",
            "created_to",
            "updated_from",
            "updated_to",
            "published_date_from",
            "published_date_to",
            "created_date_from",
            "created_date_to",
            "jalali_from",
            "jalali_to",
            "created_jalali_from",
            "created_jalali_to",
        ]

    # =========================================================
    # Helpers
    # =========================================================
    def _split_csv(self, value: str):
        if not value:
            return []
        return [item.strip() for item in value.split(",") if item.strip()]

    def _jalali_str_to_gregorian_datetime_start(self, value: str):
        """
        Convert Jalali date string مثل 1403-10-15
        به datetime شروع روز میلادی
        """
        year, month, day = map(int, value.split("-"))
        g_date = jdatetime.date(year, month, day).togregorian()
        dt = datetime.combine(g_date, time.min)
        return timezone.make_aware(dt) if timezone.is_naive(dt) else dt

    def _jalali_str_to_gregorian_datetime_end(self, value: str):
        """
        Convert Jalali date string مثل 1403-10-15
        به datetime پایان روز میلادی
        """
        year, month, day = map(int, value.split("-"))
        g_date = jdatetime.date(year, month, day).togregorian()
        dt = datetime.combine(g_date, time.max)
        return timezone.make_aware(dt) if timezone.is_naive(dt) else dt

    # =========================================================
    # Multi-value custom filters
    # =========================================================
    def filter_categories(self, queryset, name, value):
        slugs = self._split_csv(value)
        if not slugs:
            return queryset
        return queryset.filter(category__slug__in=slugs).distinct()

    def filter_tags(self, queryset, name, value):
        slugs = self._split_csv(value)
        if not slugs:
            return queryset
        return queryset.filter(tags__slug__in=slugs).distinct()

    # =========================================================
    # Jalali published_at filters
    # =========================================================
    def filter_jalali_from(self, queryset, name, value):
        try:
            dt = self._jalali_str_to_gregorian_datetime_start(value)
            return queryset.filter(published_at__gte=dt)
        except Exception:
            return queryset.none()

    def filter_jalali_to(self, queryset, name, value):
        try:
            dt = self._jalali_str_to_gregorian_datetime_end(value)
            return queryset.filter(published_at__lte=dt)
        except Exception:
            return queryset.none()

    # =========================================================
    # Jalali created_at filters
    # =========================================================
    def filter_created_jalali_from(self, queryset, name, value):
        try:
            dt = self._jalali_str_to_gregorian_datetime_start(value)
            return queryset.filter(created_at__gte=dt)
        except Exception:
            return queryset.none()

    def filter_created_jalali_to(self, queryset, name, value):
        try:
            dt = self._jalali_str_to_gregorian_datetime_end(value)
            return queryset.filter(created_at__lte=dt)
        except Exception:
            return queryset.none()
