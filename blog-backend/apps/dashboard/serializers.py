from rest_framework import serializers

from apps.news.models import HomeHeroSelection, HomeHeroSlot, Post


class MyContentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    title = serializers.CharField()
    slug = serializers.CharField()
    status = serializers.CharField()
    views = serializers.IntegerField(required=False, default=0)
    listens = serializers.IntegerField(required=False, default=0)
    duration = serializers.IntegerField(required=False, default=0)
    published_at = serializers.DateTimeField(required=False, allow_null=True)
    updated_at = serializers.DateTimeField(required=False, allow_null=True)
    cover = serializers.CharField(required=False, allow_blank=True, allow_null=True)


from django.conf import settings


def build_dashboard_file_url(file_field, request=None):
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


class HomeHeroSelectionItemSerializer(serializers.ModelSerializer):
    post_id = serializers.IntegerField(source="post.id", read_only=True)
    post_title = serializers.CharField(source="post.title", read_only=True)
    post_slug = serializers.CharField(source="post.slug", read_only=True)
    post_status = serializers.CharField(source="post.status", read_only=True)
    post_media_type = serializers.CharField(source="post.media_type", read_only=True)
    post_type = serializers.CharField(source="post.post_type", read_only=True)
    published_at = serializers.DateTimeField(source="post.published_at", read_only=True)
    cover = serializers.SerializerMethodField()

    class Meta:
        model = HomeHeroSelection
        fields = (
            "slot",
            "is_active",
            "post_id",
            "post_title",
            "post_slug",
            "post_status",
            "post_media_type",
            "post_type",
            "published_at",
            "cover",
        )

    def get_cover(self, obj):
        request = self.context.get("request")
        post = getattr(obj, "post", None)
        if not post:
            return None
        return build_dashboard_file_url(getattr(post, "cover", None), request=request)


class HomeHeroSelectionUpdateSerializer(serializers.Serializer):
    slot = serializers.ChoiceField(choices=HomeHeroSlot.choices)
    post_id = serializers.IntegerField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False, default=True)

    def validate_post_id(self, value):
        if value is None:
            return value

        if not Post.objects.filter(id=value).exists():
            raise serializers.ValidationError("Post not found.")

        return value

    def validate(self, attrs):
        post_id = attrs.get("post_id")
        if post_id is None:
            return attrs

        post = Post.objects.filter(id=post_id).first()
        if not post:
            raise serializers.ValidationError({"post_id": "Post not found."})

        # اگر فقط published باید قابل انتخاب باشد این را نگه دار
        if post.status != "published":
            raise serializers.ValidationError(
                {"post_id": "Only published posts can be assigned to hero slots."}
            )

        return attrs


class HomeHeroSelectionBulkUpdateSerializer(serializers.Serializer):
    items = HomeHeroSelectionUpdateSerializer(many=True)

    def validate(self, attrs):
        items = attrs.get("items", [])

        slots = [item["slot"] for item in items]
        post_ids = [
            item["post_id"] for item in items if item.get("post_id") is not None
        ]

        if len(slots) != len(set(slots)):
            raise serializers.ValidationError("Duplicate slots are not allowed.")

        if len(post_ids) != len(set(post_ids)):
            raise serializers.ValidationError(
                "A post cannot be assigned to multiple slots."
            )

        return attrs


class DashboardPostSearchSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()
    category_title = serializers.CharField(source="category.title", read_only=True)
    author_email = serializers.EmailField(
        source="author.email",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "status",
            "post_type",
            "media_type",
            "category_title",
            "author_email",
            "published_at",
            "created_at",
            "views",
            "cover",
        )

    def get_cover(self, obj):
        request = self.context.get("request")
        return build_dashboard_file_url(getattr(obj, "cover", None), request=request)
