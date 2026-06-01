from django.db.models import F
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.media.models import Video, Podcast
from apps.media.serializers import (
    VideoListSerializer,
    VideoDetailSerializer,
    PodcastListSerializer,
    PodcastDetailSerializer,
)


class PublicVideoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "summary", "content"]
    ordering_fields = ["published_at", "created_at", "views_count"]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Video.objects.filter(status="published")
            .select_related("category", "author", "thumbnail", "video_file")
            .prefetch_related("tags")
            .order_by("-published_at", "-created_at")
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return VideoDetailSerializer
        return VideoListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Video.objects.filter(pk=instance.pk).update(views_count=F("views_count") + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance, context={"request": request})
        return Response(serializer.data)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class PublicPodcastViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "summary", "content"]
    ordering_fields = ["published_at", "created_at", "listens_count"]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Podcast.objects.filter(status="published")
            .select_related("category", "author", "cover_image", "audio_file")
            .prefetch_related("tags")
            .order_by("-published_at", "-created_at")
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PodcastDetailSerializer
        return PodcastListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Podcast.objects.filter(pk=instance.pk).update(
            listens_count=F("listens_count") + 1
        )
        instance.refresh_from_db()
        serializer = self.get_serializer(instance, context={"request": request})
        return Response(serializer.data)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
