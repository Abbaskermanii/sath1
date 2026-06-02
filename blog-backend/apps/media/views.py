from django.core.cache import cache
from django.db.models import F
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter

from django_filters.rest_framework import DjangoFilterBackend

from apps.media.filters import VideoFilter, PodcastFilter
from apps.media.models import Video, Podcast
from apps.media.serializers import (
    VideoListSerializer,
    VideoDetailSerializer,
    PodcastListSerializer,
    PodcastDetailSerializer,
)


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def should_count_media_view(request, prefix, object_id):
    user = request.user if request.user.is_authenticated else None

    if user:
        identity = f"user:{user.id}"
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.save()
            session_key = request.session.session_key

        ip = get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:120]
        identity = f"anon:{session_key}:{ip}:{user_agent}"

    cache_key = f"{prefix}-view:{object_id}:{identity}"

    if cache.get(cache_key):
        return False

    cache.set(cache_key, True, timeout=60 * 60 * 6)
    return True


class PublicVideoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = VideoFilter

    search_fields = [
        "title",
        "summary",
        "content",
        "category__title",
        "tags__title",
    ]

    ordering_fields = [
        "published_at",
        "created_at",
        "views_count",
        "title",
    ]

    ordering = ["-published_at", "-created_at"]

    lookup_field = "slug"

    def get_queryset(self):
        return (
            Video.objects.filter(status="published")
            .select_related("category", "author", "thumbnail", "video_file")
            .prefetch_related("tags")
            .order_by("-published_at", "-created_at")
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return VideoDetailSerializer
        return VideoListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        if should_count_media_view(request, "video", instance.pk):
            Video.objects.filter(pk=instance.pk).update(
                views_count=F("views_count") + 1
            )
            instance.refresh_from_db(fields=["views_count"])

        serializer = self.get_serializer(instance, context={"request": request})
        return Response(serializer.data)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class PublicPodcastViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = PodcastFilter

    search_fields = [
        "title",
        "summary",
        "content",
        "category__title",
        "tags__title",
    ]

    ordering_fields = [
        "published_at",
        "created_at",
        "listens_count",
        "title",
    ]

    ordering = ["-published_at", "-created_at"]

    lookup_field = "slug"

    def get_queryset(self):
        return (
            Podcast.objects.filter(status="published")
            .select_related("category", "author", "cover_image", "audio_file")
            .prefetch_related("tags")
            .order_by("-published_at", "-created_at")
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PodcastDetailSerializer
        return PodcastListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        if should_count_media_view(request, "podcast", instance.pk):
            Podcast.objects.filter(pk=instance.pk).update(
                listens_count=F("listens_count") + 1
            )
            instance.refresh_from_db(fields=["listens_count"])

        serializer = self.get_serializer(instance, context={"request": request})
        return Response(serializer.data)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
