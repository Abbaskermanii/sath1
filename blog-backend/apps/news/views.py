from django.db.models import Count, Q
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.news.models import Bookmark, Category, Comment, Post, PostStatus, Tag
from apps.news.serializers import (
    BookmarkSerializer,
    CategoryListSerializer,
    CommentSerializer,
    CommentWriteSerializer,
    PostDetailSerializer,
    PostListSerializer,
    PostWriteSerializer,
    TagListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.annotate(posts_count=Count("posts")).order_by("title")
    serializer_class = CategoryListSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "slug"]
    ordering_fields = ["title", "created_at"]
    ordering = ["title"]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.annotate(posts_count=Count("posts")).order_by("title")
    serializer_class = TagListSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "slug"]
    ordering_fields = ["title", "created_at"]
    ordering = ["title"]


class PostViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "excerpt", "content"]
    ordering_fields = ["created_at", "published_at", "views", "title"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "latest", "popular"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = (
            Post.objects.select_related("author", "category")
            .prefetch_related("tags", "comments")
            .annotate(
                comments_count=Count("comments", filter=Q(comments__is_approved=True))
            )
        )

        if self.action in ["list", "retrieve", "latest", "popular"]:
            queryset = queryset.filter(status=PostStatus.PUBLISHED)

        category_slug = self.request.query_params.get("category")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        tag_slug = self.request.query_params.get("tag")
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

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
        instance.views += 1
        instance.save(update_fields=["views"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def latest(self, request):
        queryset = self.get_queryset().order_by("-published_at", "-created_at")[:10]
        serializer = PostListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def popular(self, request):
        queryset = self.get_queryset().order_by("-views", "-published_at")[:10]
        serializer = PostListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


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
    serializer_class = BookmarkSerializer

    def get_queryset(self):
        return (
            Bookmark.objects.filter(user=self.request.user)
            .select_related("post", "post__author", "post__category")
            .prefetch_related("post__tags")
            .order_by("-created_at")
        )

    def create(self, request, *args, **kwargs):
        post_id = request.data.get("post")
        if not post_id:
            return Response(
                {"detail": "Post is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        bookmark, created = Bookmark.objects.get_or_create(
            user=request.user,
            post_id=post_id,
        )

        serializer = self.get_serializer(bookmark, context={"request": request})
        return Response(
            serializer.data,
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
