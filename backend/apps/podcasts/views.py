from datetime import timezone

from django.shortcuts import render

# Create your views here.
from django.db.models import (
    Q,
    BooleanField,
    Count,
    Exists,
    OuterRef,
    Prefetch,
    Value,
    F,
)
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import PermissionDenied
from config.permissions import IsOwnerOrAdmin, IsCommentOwnerOrAdmin


from .filters import PodcastFilter
from .models import (
    Podcast,
    PodcastComment,
    PodcastLike,
    PodcastBookmark,
)
from .serializers import (
    PodcastListSerializer,
    PodcastDetailSerializer,
    PodcastWriteSerializer,
    PodcastCommentSerializer,
    PodcastRelatedSerializer,
    PodcastLandingSerializer,
)
from apps.news.models import Category, Tag


def with_user_reactions(queryset, user):
    queryset = queryset.annotate(
        comments_count=Count("comments", distinct=True),
        likes_count=Count("likes", distinct=True),
        bookmarks_count=Count("bookmarks", distinct=True),
    )

    if user and user.is_authenticated:
        queryset = queryset.annotate(
            is_liked=Exists(
                PodcastLike.objects.filter(
                    podcast_id=OuterRef("pk"),
                    user=user,
                )
            ),
            is_bookmarked=Exists(
                PodcastBookmark.objects.filter(
                    podcast_id=OuterRef("pk"),
                    user=user,
                )
            ),
        )
    else:
        queryset = queryset.annotate(
            is_liked=Value(False, output_field=BooleanField()),
            is_bookmarked=Value(False, output_field=BooleanField()),
        )

    return queryset


def get_published_podcasts_queryset(user=None):
    queryset = (
        Podcast.objects.published()
        .select_related(
            "author",
            "category",
        )
        .prefetch_related("tags")
    )
    return with_user_reactions(queryset, user)


@extend_schema(tags=["Podcasts"])
class PodcastListCreateAPIView(generics.ListCreateAPIView):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PodcastFilter
    search_fields = [
        "title",
        "summary",
        "description",
        "slug",
        "author__username",
        "category__name",
        "tags__name",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "published_at",
        "views_count",
        "listen_count",
    ]
    ordering = ["-published_at", "-created_at"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            queryset = Podcast.objects.select_related(
                "author", "category"
            ).prefetch_related("tags")
            return with_user_reactions(queryset, user).distinct()

        return get_published_podcasts_queryset(user).distinct()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PodcastWriteSerializer
        return PodcastListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


@extend_schema(tags=["Podcasts"])
class PodcastDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field = "slug"

    def get_permissions(self):
        if self.request.method in ["PATCH", "PUT", "DELETE"]:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        user = self.request.user

        base_queryset = Podcast.objects.select_related(
            "author",
            "category",
        ).prefetch_related("tags")

        if user.is_authenticated and user.is_staff:
            return with_user_reactions(base_queryset, user).distinct()

        if user.is_authenticated:
            queryset = base_queryset.filter(
                Q(
                    status=Podcast.Status.PUBLISHED,
                    published_at__isnull=False,
                    published_at__lte=timezone.now(),
                )
                | Q(author=user)
            )
            return with_user_reactions(queryset, user).distinct()

        queryset = base_queryset.filter(
            status=Podcast.Status.PUBLISHED,
            published_at__isnull=False,
            published_at__lte=timezone.now(),
        )
        return with_user_reactions(queryset, user).distinct()

        def get_serializer_class(self):
            if self.request.method in ["PATCH", "PUT"]:
                return PodcastWriteSerializer
            return PodcastDetailSerializer

        def retrieve(self, request, *args, **kwargs):
            instance = self.get_object()
            Podcast.objects.filter(pk=instance.pk).update(
                views_count=F("views_count") + 1
            )
            instance.refresh_from_db()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)


@extend_schema(tags=["Podcast Comments"])
class PodcastCommentListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    def get_queryset(self):
        podcast_slug = self.kwargs["slug"]
        podcast = get_object_or_404(Podcast, slug=podcast_slug)
        return podcast.comments.filter(
            is_approved=True, parent__isnull=True
        ).select_related("user")

    def get_serializer_class(self):
        return PodcastCommentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        podcast = get_object_or_404(Podcast, slug=self.kwargs["slug"])
        serializer.save(user=self.request.user, podcast=podcast)


class PodcastCommentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PodcastComment.objects.select_related("user", "podcast")
    serializer_class = PodcastCommentSerializer

    def get_permissions(self):
        if self.request.method in ["PATCH", "PUT", "DELETE"]:
            return [IsAuthenticated(), IsCommentOwnerOrAdmin()]
        return [AllowAny()]


@extend_schema(tags=["Podcasts"])
class PodcastLikeToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        podcast = get_object_or_404(Podcast, slug=slug)

        obj, created = PodcastLike.objects.get_or_create(
            podcast=podcast,
            user=request.user,
        )

        if not created:
            obj.delete()
            return Response({"liked": False}, status=status.HTTP_200_OK)

        return Response({"liked": True}, status=status.HTTP_200_OK)


@extend_schema(tags=["Podcasts"])
class PodcastBookmarkToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        podcast = get_object_or_404(Podcast, slug=slug)

        obj, created = PodcastBookmark.objects.get_or_create(
            podcast=podcast,
            user=request.user,
        )

        if not created:
            obj.delete()
            return Response({"bookmarked": False}, status=status.HTTP_200_OK)

        return Response({"bookmarked": True}, status=status.HTTP_200_OK)


@extend_schema(tags=["Podcasts"])
class MyBookmarkedPodcastListAPIView(generics.ListAPIView):
    serializer_class = PodcastListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Podcast.objects.filter(bookmarks__user=self.request.user)
            .select_related("author", "category")
            .prefetch_related("tags")
        )
        return with_user_reactions(queryset, self.request.user).distinct()


@extend_schema(tags=["Podcasts"])
class MyLikedPodcastListAPIView(generics.ListAPIView):
    serializer_class = PodcastListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Podcast.objects.filter(likes__user=self.request.user)
            .select_related("author", "category")
            .prefetch_related("tags")
        )
        return with_user_reactions(queryset, self.request.user).distinct()


@extend_schema(tags=["Podcasts"])
class LatestPodcastsAPIView(generics.ListAPIView):
    serializer_class = PodcastListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return get_published_podcasts_queryset(self.request.user).distinct()[:10]


@extend_schema(tags=["Podcasts"])
class FeaturedPodcastsAPIView(generics.ListAPIView):
    serializer_class = PodcastListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            get_published_podcasts_queryset(self.request.user)
            .filter(is_featured=True)
            .distinct()[:10]
        )


@extend_schema(tags=["Podcasts"])
class RelatedPodcastsAPIView(generics.ListAPIView):
    serializer_class = PodcastRelatedSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        slug = self.kwargs["slug"]
        podcast = get_object_or_404(
            Podcast.objects.published().prefetch_related("tags"),
            slug=slug,
        )

        tag_ids = podcast.tags.values_list("id", flat=True)

        queryset = (
            Podcast.objects.published()
            .filter(tags__in=tag_ids)
            .exclude(pk=podcast.pk)
            .select_related("category")
            .prefetch_related("tags")
            .distinct()
        )

        return queryset[:10]


@extend_schema(tags=["Podcasts"])
class PodcastCategoryLandingAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        category = get_object_or_404(Category, slug=slug)

        podcasts_qs = (
            get_published_podcasts_queryset(request.user)
            .filter(category=category)
            .distinct()
        )
        latest_podcasts = podcasts_qs[:10]

        data = {
            "title": category.name,
            "slug": category.slug,
            "podcasts_count": podcasts_qs.count(),
            "latest_podcasts": PodcastListSerializer(
                latest_podcasts,
                many=True,
                context={"request": request},
            ).data,
        }

        serializer = PodcastLandingSerializer(data)
        return Response(serializer.data)


@extend_schema(tags=["Podcasts"])
class PodcastTagLandingAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        tag = get_object_or_404(Tag, slug=slug)

        podcasts_qs = (
            get_published_podcasts_queryset(request.user).filter(tags=tag).distinct()
        )
        latest_podcasts = podcasts_qs[:10]

        data = {
            "title": tag.name,
            "slug": tag.slug,
            "podcasts_count": podcasts_qs.count(),
            "latest_podcasts": PodcastListSerializer(
                latest_podcasts,
                many=True,
                context={"request": request},
            ).data,
        }

        serializer = PodcastLandingSerializer(data)
        return Response(serializer.data)
