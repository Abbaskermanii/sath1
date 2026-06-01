from rest_framework import serializers

from apps.news.serializers import CategorySerializer, TagSerializer
from .models import Video, VideoComment


class VideoCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = VideoComment
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
        return VideoCommentSerializer(replies, many=True, context=self.context).data


class VideoListSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    comments_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    bookmarks_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True)
    is_bookmarked = serializers.BooleanField(read_only=True)

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "thumbnail",
            "video_url",
            "duration_seconds",
            "status",
            "is_featured",
            "views_count",
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


class VideoDetailSerializer(serializers.ModelSerializer):
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
        model = Video
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "thumbnail",
            "video_file",
            "video_url",
            "duration_seconds",
            "status",
            "is_featured",
            "views_count",
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
        return VideoCommentSerializer(comments, many=True, context=self.context).data


class VideoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "thumbnail",
            "video_file",
            "video_url",
            "duration_seconds",
            "status",
            "is_featured",
            "published_at",
            "category",
            "tags",
        ]

    def validate(self, attrs):
        video_file = attrs.get("video_file", getattr(self.instance, "video_file", None))
        video_url = attrs.get("video_url", getattr(self.instance, "video_url", ""))

        if not video_file and not video_url:
            raise serializers.ValidationError(
                "At least one of video_file or video_url is required."
            )
        return attrs


class RelatedVideoSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "thumbnail",
            "duration_seconds",
            "published_at",
            "category",
            "tags",
        ]


class VideoLandingSerializer(serializers.Serializer):
    title = serializers.CharField()
    slug = serializers.CharField()
    videos_count = serializers.IntegerField()
    latest_videos = VideoListSerializer(many=True)
