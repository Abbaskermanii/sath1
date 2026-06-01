from rest_framework import serializers

from apps.news.serializers import CategorySerializer, TagSerializer
from .models import (
    Podcast,
    PodcastComment,
)


class PodcastCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = PodcastComment
        fields = [
            "id",
            "user",
            "parent",
            "content",
            "is_approved",
            "created_at",
            "replies",
        ]
        read_only_fields = ["id", "user", "is_approved", "created_at", "replies"]

    def get_replies(self, obj):
        if obj.parent_id is not None:
            return []
        replies = obj.replies.filter(is_approved=True)
        return PodcastCommentSerializer(replies, many=True, context=self.context).data


class PodcastListSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    bookmarks_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True)
    is_bookmarked = serializers.BooleanField(read_only=True)

    class Meta:
        model = Podcast
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "cover_image",
            "audio_url",
            "duration_seconds",
            "status",
            "is_featured",
            "views_count",
            "listen_count",
            "published_at",
            "created_at",
            "author",
            "category",
            "tags",
            "comments_count",
            "likes_count",
            "bookmarks_count",
            "is_liked",
            "is_bookmarked",
        ]


class PodcastDetailSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    bookmarks_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True)
    is_bookmarked = serializers.BooleanField(read_only=True)

    class Meta:
        model = Podcast
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "cover_image",
            "audio_file",
            "audio_url",
            "duration_seconds",
            "status",
            "is_featured",
            "views_count",
            "listen_count",
            "published_at",
            "created_at",
            "updated_at",
            "author",
            "category",
            "tags",
            "comments",
            "comments_count",
            "likes_count",
            "bookmarks_count",
            "is_liked",
            "is_bookmarked",
        ]

    def get_comments(self, obj):
        comments = obj.comments.filter(parent__isnull=True, is_approved=True)
        return PodcastCommentSerializer(comments, many=True, context=self.context).data


class PodcastWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Podcast
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "cover_image",
            "audio_file",
            "audio_url",
            "duration_seconds",
            "status",
            "is_featured",
            "published_at",
            "category",
            "tags",
        ]

    def validate(self, attrs):
        audio_file = attrs.get("audio_file", getattr(self.instance, "audio_file", None))
        audio_url = attrs.get("audio_url", getattr(self.instance, "audio_url", ""))

        if not audio_file and not audio_url:
            raise serializers.ValidationError(
                "At least one of audio_file or audio_url is required."
            )
        return attrs


class PodcastRelatedSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Podcast
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "cover_image",
            "duration_seconds",
            "published_at",
            "category",
            "tags",
        ]


class PodcastLandingSerializer(serializers.Serializer):
    title = serializers.CharField()
    slug = serializers.CharField()
    podcasts_count = serializers.IntegerField()
    latest_podcasts = PodcastListSerializer(many=True)
