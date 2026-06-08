from django.core.cache import cache
from django.db.models import Count, Q, F, Case, When, IntegerField
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from apps.news.filters import PostFilter
from apps.news.models import (
    Bookmark,
    Category,
    Comment,
    HomepageSection,
    MediaType,
    Post,
    PostStatus,
    PostType,
    Tag,
)
from apps.news.serializers import (
    BookmarkCreateSerializer,
    BookmarkSerializer,
    CategoryListSerializer,
    CategoryWriteSerializer,
    CommentSerializer,
    CommentWriteSerializer,
    PostDetailSerializer,
    PostListSerializer,
    PostWriteSerializer,
    TagListSerializer,
    TagWriteSerializer,
)


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def should_count_post_view(request, post_id):
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

    cache_key = f"post-view:{post_id}:{identity}"

    if cache.get(cache_key):
        return False

    cache.set(cache_key, True, timeout=60 * 60 * 6)
    return True


class CategoryViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "slug"]
    ordering_fields = ["title", "created_at"]
    ordering = ["title"]

    def get_queryset(self):
        return Category.objects.annotate(
            posts_count=Count(
                "posts",
                filter=Q(posts__status=PostStatus.PUBLISHED),
            )
        ).order_by("title")

    def get_permissions(self):
        if self.action in ["list", "retrieve", "page"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CategoryWriteSerializer
        return CategoryListSerializer

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def page(self, request, slug=None):
        category = self.get_object()

        base_qs = (
            Post.objects.filter(
                status=PostStatus.PUBLISHED,
                category=category,
            )
            .select_related("author", "category")
            .prefetch_related("tags")
            .annotate(
                comments_count=Count(
                    "comments",
                    filter=Q(comments__is_approved=True),
                )
            )
        )

        hero = base_qs.filter(is_hero=True).order_by(
            "homepage_order",
            "-published_at",
            "-created_at",
        )[:3]

        featured = base_qs.filter(is_featured=True).order_by(
            "homepage_order",
            "-published_at",
            "-created_at",
        )[:6]

        latest = base_qs.order_by("-published_at", "-created_at")[:12]
        popular = base_qs.order_by("-views", "-published_at", "-created_at")[:10]

        context = {"request": request}

        return Response(
            {
                "category": CategoryListSerializer(category, context=context).data,
                "hero": PostListSerializer(hero, many=True, context=context).data,
                "featured": PostListSerializer(
                    featured, many=True, context=context
                ).data,
                "latest": PostListSerializer(latest, many=True, context=context).data,
                "popular": PostListSerializer(popular, many=True, context=context).data,
            }
        )


class TagViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "slug"]
    ordering_fields = ["title", "created_at"]
    ordering = ["title"]

    def get_queryset(self):
        return Tag.objects.annotate(
            posts_count=Count(
                "posts",
                filter=Q(posts__status=PostStatus.PUBLISHED),
            )
        ).order_by("title")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TagWriteSerializer
        return TagListSerializer


class PostViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = PostFilter

    search_fields = [
        "title",
        "excerpt",
        "content",
        "category__title",
        "tags__title",
    ]

    ordering_fields = [
        "created_at",
        "published_at",
        "views",
        "title",
        "homepage_order",
    ]

    ordering = ["-published_at", "-created_at"]

    def get_permissions(self):
        if self.action in [
            "list",
            "retrieve",
            "latest",
            "popular",
            "home",
            "related",
            "mine",
            "post_types",
            "homepage_sections",
            "media_types",
        ]:
            if self.action == "mine":
                return [IsAuthenticated()]
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        include_drafts = self.request.query_params.get("include_drafts") == "1"

        queryset = (
            Post.objects.select_related("author", "category")
            .prefetch_related("tags", "comments")
            .annotate(
                comments_count=Count(
                    "comments",
                    filter=Q(comments__is_approved=True),
                )
            )
        )

        if user.is_authenticated and (
            user.is_staff or getattr(user, "role", "") == "admin"
        ):
            return queryset.distinct()

        if self.action == "retrieve" and include_drafts and user.is_authenticated:
            return queryset.filter(
                Q(status=PostStatus.PUBLISHED) | Q(author=user)
            ).distinct()

        if self.action in ["list", "latest", "popular", "home", "related"]:
            return queryset.filter(status=PostStatus.PUBLISHED).distinct()

        if self.action == "retrieve":
            if user.is_authenticated:
                return queryset.filter(
                    Q(status=PostStatus.PUBLISHED) | Q(author=user)
                ).distinct()
            return queryset.filter(status=PostStatus.PUBLISHED).distinct()

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PostDetailSerializer

        if self.action in ["create", "update", "partial_update"]:
            return PostWriteSerializer

        return PostListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        if should_count_post_view(request, instance.pk):
            Post.objects.filter(pk=instance.pk).update(views=F("views") + 1)
            instance.refresh_from_db(fields=["views"])

        serializer = self.get_serializer(instance, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def latest(self, request):
        limit = int(request.query_params.get("limit", 10))
        limit = min(limit, 50)

        queryset = self.filter_queryset(self.get_queryset()).order_by(
            "-published_at",
            "-created_at",
        )[:limit]

        serializer = PostListSerializer(
            queryset,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def popular(self, request):
        limit = int(request.query_params.get("limit", 10))
        limit = min(limit, 50)

        queryset = self.filter_queryset(self.get_queryset()).order_by(
            "-views",
            "-published_at",
            "-created_at",
        )[:limit]

        serializer = PostListSerializer(
            queryset,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def home(self, request):
        base_qs = (
            self.get_queryset()
            .filter(show_on_homepage=True)
            .order_by("homepage_order", "-published_at", "-created_at")
        )

        latest_qs = self.get_queryset().order_by("-published_at", "-created_at")[:12]

        def section_qs(section, limit=8):
            return base_qs.filter(homepage_section=section)[:limit]

        context = {"request": request}

        data = {
            "hero": PostListSerializer(
                self.get_queryset()
                .filter(is_hero=True)
                .order_by("homepage_order", "-published_at", "-created_at")[:3],
                many=True,
                context=context,
            ).data,
            "featured": PostListSerializer(
                self.get_queryset()
                .filter(is_featured=True)
                .order_by("homepage_order", "-published_at", "-created_at")[:8],
                many=True,
                context=context,
            ).data,
            "top_stories": PostListSerializer(
                section_qs(HomepageSection.TOP_STORIES, 8),
                many=True,
                context=context,
            ).data,
            "latest": PostListSerializer(
                latest_qs,
                many=True,
                context=context,
            ).data,
            "opinion": PostListSerializer(
                self.get_queryset()
                .filter(post_type=PostType.NOTE)
                .order_by("-published_at", "-created_at")[:6],
                many=True,
                context=context,
            ).data,
            "explainers": PostListSerializer(
                self.get_queryset()
                .filter(post_type=PostType.ANALYSIS)
                .order_by("-published_at", "-created_at")[:6],
                many=True,
                context=context,
            ).data,
            "how_to": PostListSerializer(
                section_qs(HomepageSection.HOW_TO, 6),
                many=True,
                context=context,
            ).data,
            "market": PostListSerializer(
                section_qs(HomepageSection.MARKET, 8),
                many=True,
                context=context,
            ).data,
            "business": PostListSerializer(
                section_qs(HomepageSection.BUSINESS, 8),
                many=True,
                context=context,
            ).data,
            "culture": PostListSerializer(
                section_qs(HomepageSection.CULTURE, 8),
                many=True,
                context=context,
            ).data,
            "work_life": PostListSerializer(
                section_qs(HomepageSection.WORK_LIFE, 8),
                many=True,
                context=context,
            ).data,
            "green": PostListSerializer(
                section_qs(HomepageSection.GREEN, 8),
                many=True,
                context=context,
            ).data,
        }

        return Response(data)

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def related(self, request, slug=None):
        post = self.get_object()

        queryset = (
            self.get_queryset()
            .exclude(pk=post.pk)
            .filter(Q(category=post.category) | Q(tags__in=post.tags.all()))
            .distinct()
            .order_by("-published_at", "-created_at")[:8]
        )

        serializer = PostListSerializer(
            queryset,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        qs = (
            Post.objects.filter(author=request.user)
            .select_related("author", "category")
            .prefetch_related("tags", "comments")
            .annotate(
                comments_count=Count(
                    "comments",
                    filter=Q(comments__is_approved=True),
                ),
                draft_priority=Case(
                    When(status=PostStatus.DRAFT, then=0),
                    default=1,
                    output_field=IntegerField(),
                ),
            )
            .order_by("draft_priority", "-updated_at", "-created_at")
        )

        # اگر خواستی فیلتر/search/order خود DRF هم روی mine اعمال شود
        qs = self.filter_queryset(qs)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = PostListSerializer(
                page,
                many=True,
                context={"request": request},
            )
            return self.get_paginated_response(serializer.data)

        serializer = PostListSerializer(
            qs,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def post_types(self, request):
        return Response(
            [{"value": value, "label": label} for value, label in PostType.choices]
        )

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def homepage_sections(self, request):
        return Response(
            [
                {"value": value, "label": label}
                for value, label in HomepageSection.choices
            ]
        )

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def media_types(self, request):
        return Response(
            [{"value": value, "label": label} for value, label in MediaType.choices]
        )


class CommentViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Comment.objects.select_related("user", "post")

        post_id = self.request.query_params.get("post")
        if post_id:
            queryset = queryset.filter(post_id=post_id)

        return queryset.order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return CommentWriteSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.user != request.user:
            return Response(
                {"detail": "You do not have permission to delete this comment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)


class BookmarkViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return BookmarkCreateSerializer
        return BookmarkSerializer

    def get_queryset(self):
        return (
            Bookmark.objects.filter(user=self.request.user)
            .select_related("post", "post__author", "post__category")
            .prefetch_related("post__tags")
            .order_by("-created_at")
        )

    def create(self, request, *args, **kwargs):
        serializer = BookmarkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post_id = serializer.validated_data["post"]

        bookmark, created = Bookmark.objects.get_or_create(
            user=request.user,
            post_id=post_id,
        )

        output_serializer = BookmarkSerializer(
            bookmark,
            context={"request": request},
        )

        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.user != request.user:
            return Response(
                {"detail": "You do not have permission to delete this bookmark."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)
