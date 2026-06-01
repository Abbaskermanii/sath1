import django_filters
from .models import Video, Podcast


class VideoFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name="category__id")
    tag = django_filters.NumberFilter(field_name="tags__id")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Video
        fields = ["category", "tag", "is_featured"]


class PodcastFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name="category__id")
    tag = django_filters.NumberFilter(field_name="tags__id")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Podcast
        fields = ["category", "tag", "is_featured"]
