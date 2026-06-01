from rest_framework import serializers

from apps.news.models import Bookmark, Category, Comment, Post, Tag


class AuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    full_name = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.email


class CategoryListSerializer(serializers.ModelSerializer):
    posts_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = (
            "id",
            "title",
            "slug",
            "posts_count",
        )


class TagListSerializer(serializers.ModelSerializer):
    posts_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tag
        fields = (
            "id",
            "title",
            "slug",
            "posts_count",
        )


class CommentSerializer(serializers.ModelSerializer):
    user = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "post",
            "user",
            "text",
            "is_approved",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "user",
            "is_approved",
            "created_at",
            "updated_at",
        )


class PostListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategoryListSerializer(read_only=True)
    tags = TagListSerializer(many=True, read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "cover",
            "author",
            "category",
            "tags",
            "status",
            "views",
            "published_at",
            "created_at",
            "comments_count",
            "is_bookmarked",
        )

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Bookmark.objects.filter(post=obj, user=request.user).exists()


class PostDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategoryListSerializer(read_only=True)
    tags = TagListSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover",
            "author",
            "category",
            "tags",
            "status",
            "views",
            "published_at",
            "created_at",
            "updated_at",
            "comments",
            "is_bookmarked",
        )

    def get_comments(self, obj):
        comments = obj.comments.filter(is_approved=True).order_by("-created_at")
        return CommentSerializer(comments, many=True, context=self.context).data

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Bookmark.objects.filter(post=obj, user=request.user).exists()


class PostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover",
            "category",
            "tags",
            "status",
            "published_at",
        )
        read_only_fields = ("id", "slug")


class CommentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = (
            "id",
            "post",
            "text",
        )
        read_only_fields = ("id",)


class BookmarkSerializer(serializers.ModelSerializer):
    post = PostListSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = (
            "id",
            "post",
            "created_at",
        )
        read_only_fields = (
            "id",
            "created_at",
        )
