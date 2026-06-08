import re

from django.conf import settings
from django.utils.text import slugify
from rest_framework import serializers

from apps.news.models import (
    Bookmark,
    Category,
    Comment,
    HomepageSection,
    MediaType,
    Post,
    PostType,
    Tag,
)

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def build_public_file_url(file_field):
    if not file_field:
        return None

    try:
        url = file_field.url
    except Exception:
        return None

    internal = getattr(settings, "MINIO_INTERNAL_URL", "")
    public = getattr(settings, "MINIO_PUBLIC_URL", "")

    if internal and public and internal in url:
        return url.replace(internal, public)

    return url


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
        fields = (
            "id",
            "title",
            "slug",
        )
        read_only_fields = ("id",)


class TagWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = (
            "id",
            "title",
            "slug",
        )
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

    cover = serializers.SerializerMethodField()
    video_file = serializers.SerializerMethodField()
    audio_file = serializers.SerializerMethodField()

    post_type_label = serializers.CharField(
        source="get_post_type_display",
        read_only=True,
    )
    homepage_section_label = serializers.CharField(
        source="get_homepage_section_display",
        read_only=True,
    )
    media_type_label = serializers.CharField(
        source="get_media_type_display",
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
            "video_file",
            "audio_file",
            "embed_url",
            "media_duration",
            "author",
            "category",
            "tags",
            "status",
            "post_type",
            "post_type_label",
            "media_type",
            "media_type_label",
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

    def get_cover(self, obj):
        return build_public_file_url(obj.cover)

    def get_video_file(self, obj):
        return build_public_file_url(obj.video_file)

    def get_audio_file(self, obj):
        return build_public_file_url(obj.audio_file)

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
    comments_count = serializers.IntegerField(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()

    cover = serializers.SerializerMethodField()
    video_file = serializers.SerializerMethodField()
    audio_file = serializers.SerializerMethodField()

    post_type_display = serializers.CharField(
        source="get_post_type_display",
        read_only=True,
    )
    homepage_section_display = serializers.CharField(
        source="get_homepage_section_display",
        read_only=True,
    )
    media_type_display = serializers.CharField(
        source="get_media_type_display",
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
            "video_file",
            "audio_file",
            "embed_url",
            "media_duration",
            "author",
            "category",
            "tags",
            "status",
            "views",
            "comments",
            "comments_count",
            "is_bookmarked",
            "post_type",
            "post_type_display",
            "media_type",
            "media_type_display",
            "homepage_section",
            "homepage_section_display",
            "published_at",
            "created_at",
            "updated_at",
            "is_featured",
            "is_hero",
            "show_on_homepage",
            "homepage_order",
        )

    def get_cover(self, obj):
        return build_public_file_url(obj.cover)

    def get_video_file(self, obj):
        return build_public_file_url(obj.video_file)

    def get_audio_file(self, obj):
        return build_public_file_url(obj.audio_file)

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Bookmark.objects.filter(post=obj, user=request.user).exists()

    def get_comments(self, obj):
        request = self.context.get("request")
        qs = obj.comments.all().order_by("-created_at")

        if not request or not request.user.is_authenticated:
            qs = qs.filter(is_approved=True)
        else:
            user = request.user
            is_admin = getattr(user, "role", None) == "admin" or getattr(
                user, "is_staff", False
            )
            is_author = obj.author_id == user.id

            if not (is_admin or is_author):
                qs = qs.filter(is_approved=True)

        return CommentSerializer(qs, many=True, context=self.context).data


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
            "media_type",
            "video_file",
            "audio_file",
            "embed_url",
            "media_duration",
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

    def validate_media_type(self, value):
        valid_values = [choice[0] for choice in MediaType.choices]
        if value not in valid_values:
            raise serializers.ValidationError("media_type نامعتبر است.")
        return value

    def validate_homepage_section(self, value):
        valid_values = [choice[0] for choice in HomepageSection.choices]
        if value not in valid_values:
            raise serializers.ValidationError("homepage_section نامعتبر است.")
        return value

    def _generate_unique_slug(self, title, current_instance=None):
        base_slug = slugify(title or "", allow_unicode=False) or "post"
        slug = base_slug
        i = 1

        qs = Post.objects.all()
        if current_instance is not None:
            qs = qs.exclude(pk=current_instance.pk)

        while qs.filter(slug=slug).exists():
            i += 1
            slug = f"{base_slug}-{i}"

        return slug

    def validate(self, attrs):
        instance = getattr(self, "instance", None)

        slug = attrs.get("slug")
        title = attrs.get("title") or (instance.title if instance else "")

        media_type = attrs.get(
            "media_type",
            instance.media_type if instance else MediaType.NONE,
        )
        video_file = attrs.get("video_file", getattr(instance, "video_file", None))
        audio_file = attrs.get("audio_file", getattr(instance, "audio_file", None))
        embed_url = attrs.get("embed_url", getattr(instance, "embed_url", ""))

        if slug:
            qs = Post.objects.filter(slug=slug)
            if instance is not None:
                qs = qs.exclude(pk=instance.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    {"slug": "این اسلاگ قبلاً استفاده شده است."}
                )

        if media_type == MediaType.VIDEO:
            if not video_file and not embed_url:
                raise serializers.ValidationError(
                    {
                        "video_file": "برای پست ویدیویی، فایل ویدیو یا لینک embed الزامی است."
                    }
                )
            attrs["audio_file"] = None

        elif media_type == MediaType.PODCAST:
            if not audio_file and not embed_url:
                raise serializers.ValidationError(
                    {
                        "audio_file": "برای پست پادکست، فایل صوتی یا لینک embed الزامی است."
                    }
                )
            attrs["video_file"] = None

        else:
            attrs["video_file"] = None
            attrs["audio_file"] = None
            attrs["embed_url"] = ""
            attrs["media_duration"] = None

        if not slug:
            attrs["slug"] = self._generate_unique_slug(title, current_instance=instance)

        return attrs

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        slug = validated_data.get("slug")

        if not slug:
            validated_data["slug"] = instance.slug
        else:
            validated_data["slug"] = slug.strip().lower()

        return super().update(instance, validated_data)


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

    def validate_post(self, value):
        if not Post.objects.filter(pk=value).exists():
            raise serializers.ValidationError("پست موردنظر پیدا نشد.")
        return value


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
