import re
from django.utils.text import slugify
from rest_framework import serializers

from apps.news.models import (
    Bookmark,
    Category,
    Comment,
    Post,
    Tag,
    PostType,
    HomepageSection,
)


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


class CategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "title", "slug")
        read_only_fields = ("id",)


class TagWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "title", "slug")
        read_only_fields = ("id",)


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

    post_type_label = serializers.CharField(
        source="get_post_type_display", read_only=True
    )
    homepage_section_label = serializers.CharField(
        source="get_homepage_section_display",
        read_only=True,
    )

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
            "post_type",
            "post_type_label",
            "views",
            "published_at",
            "created_at",
            "comments_count",
            "is_bookmarked",
            "is_featured",
            "is_hero",
            "show_on_homepage",
            "homepage_section",
            "homepage_section_label",
            "homepage_order",
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

    post_type_label = serializers.CharField(
        source="get_post_type_display", read_only=True
    )
    homepage_section_label = serializers.CharField(
        source="get_homepage_section_display",
        read_only=True,
    )

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
            "post_type",
            "post_type_label",
            "views",
            "published_at",
            "created_at",
            "updated_at",
            "comments",
            "is_bookmarked",
            "is_featured",
            "is_hero",
            "show_on_homepage",
            "homepage_section",
            "homepage_section_label",
            "homepage_order",
        )

    def get_comments(self, obj):
        comments = obj.comments.filter(is_approved=True).order_by("-created_at")
        return CommentSerializer(comments, many=True, context=self.context).data

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Bookmark.objects.filter(post=obj, user=request.user).exists()


SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class PostWriteSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(required=False, allow_blank=True)

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
            "post_type",
            "published_at",
            "is_featured",
            "is_hero",
            "show_on_homepage",
            "homepage_section",
            "homepage_order",
        )
        read_only_fields = ("id",)

    def validate_slug(self, value):
        if not value:
            return ""

        value = value.strip().lower()
        if not SLUG_RE.fullmatch(value):
            raise serializers.ValidationError(
                "اسلاگ باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد. مثال: my-post-123"
            )
        return value

    def validate_post_type(self, value):
        valid_values = [choice[0] for choice in PostType.choices]
        if value not in valid_values:
            raise serializers.ValidationError("post_type نامعتبر است.")
        return value

    def validate_homepage_section(self, value):
        valid_values = [choice[0] for choice in HomepageSection.choices]
        if value not in valid_values:
            raise serializers.ValidationError("homepage_section نامعتبر است.")
        return value

    def create(self, validated_data):
        slug = validated_data.get("slug")
        title = validated_data.get("title")

        if not slug:
            base_slug = slugify(title, allow_unicode=False) or "post"
            slug = base_slug
            i = 1

            while Post.objects.filter(slug=slug).exists():
                i += 1
                slug = f"{base_slug}-{i}"

        validated_data["slug"] = slug
        return super().create(validated_data)


class CommentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = (
            "id",
            "post",
            "text",
        )
        read_only_fields = ("id",)


class BookmarkCreateSerializer(serializers.Serializer):
    post = serializers.IntegerField()


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


class HomePageSerializer(serializers.Serializer):
    hero = PostListSerializer(many=True)
    featured = PostListSerializer(many=True)
    top_stories = PostListSerializer(many=True)
    latest = PostListSerializer(many=True)
    opinion = PostListSerializer(many=True)
    explainers = PostListSerializer(many=True)
    how_to = PostListSerializer(many=True)
    market = PostListSerializer(many=True)
    business = PostListSerializer(many=True)
    culture = PostListSerializer(many=True)
    work_life = PostListSerializer(many=True)
    green = PostListSerializer(many=True)


class CategoryPageSerializer(serializers.Serializer):
    category = CategoryListSerializer()
    hero = PostListSerializer(many=True)
    featured = PostListSerializer(many=True)
    latest = PostListSerializer(many=True)
    popular = PostListSerializer(many=True)
