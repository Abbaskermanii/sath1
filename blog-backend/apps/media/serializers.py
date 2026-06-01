from rest_framework import serializers

from apps.media.models import MediaFile, Video, Podcast
from apps.news.models import Category, Tag


class CategorySimpleSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="title", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "title", "slug"]


class TagSimpleSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="title", read_only=True)

    class Meta:
        model = Tag
        fields = ["id", "name", "title", "slug"]


class MediaFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = [
            "id",
            "title",
            "alt_text",
            "file_type",
            "mime_type",
            "file_size",
            "url",
            "created_at",
        ]

    def get_url(self, obj):
        request = self.context.get("request")
        if not obj.file:
            return None
        try:
            url = obj.file.url
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url


class VideoListSerializer(serializers.ModelSerializer):
    category = CategorySimpleSerializer(read_only=True)
    tags = TagSimpleSerializer(many=True, read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "duration",
            "views_count",
            "published_at",
            "is_featured",
            "category",
            "tags",
            "thumbnail_url",
        ]

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if not obj.thumbnail or not obj.thumbnail.file:
            return None
        try:
            url = obj.thumbnail.file.url
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url


class VideoDetailSerializer(serializers.ModelSerializer):
    category = CategorySimpleSerializer(read_only=True)
    tags = TagSimpleSerializer(many=True, read_only=True)
    thumbnail = MediaFileSerializer(read_only=True)
    video_file = MediaFileSerializer(read_only=True)

    thumbnail_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "embed_url",
            "duration",
            "views_count",
            "published_at",
            "is_featured",
            "status",
            "category",
            "tags",
            "thumbnail",
            "video_file",
            "thumbnail_url",
            "video_url",
            "created_at",
            "updated_at",
        ]

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if not obj.thumbnail or not obj.thumbnail.file:
            return None
        try:
            url = obj.thumbnail.file.url
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url

    def get_video_url(self, obj):
        request = self.context.get("request")
        if not obj.video_file or not obj.video_file.file:
            return None
        try:
            url = obj.video_file.file.url
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url


class PodcastListSerializer(serializers.ModelSerializer):
    category = CategorySimpleSerializer(read_only=True)
    tags = TagSimpleSerializer(many=True, read_only=True)
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Podcast
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "duration",
            "listens_count",
            "published_at",
            "is_featured",
            "category",
            "tags",
            "cover_url",
        ]

    def get_cover_url(self, obj):
        request = self.context.get("request")
        if not obj.cover_image or not obj.cover_image.file:
            return None
        try:
            url = obj.cover_image.file.url
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url


class PodcastDetailSerializer(serializers.ModelSerializer):
    category = CategorySimpleSerializer(read_only=True)
    tags = TagSimpleSerializer(many=True, read_only=True)

    cover_image = MediaFileSerializer(read_only=True)
    audio_file = MediaFileSerializer(read_only=True)

    cover_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = Podcast
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "duration",
            "listens_count",
            "published_at",
            "is_featured",
            "status",
            "category",
            "tags",
            "cover_image",
            "audio_file",
            "cover_url",
            "audio_url",
            "created_at",
            "updated_at",
        ]

    def get_cover_url(self, obj):
        request = self.context.get("request")
        if not obj.cover_image or not obj.cover_image.file:
            return None
        try:
            url = obj.cover_image.file.url
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url

    def get_audio_url(self, obj):
        request = self.context.get("request")
        if not obj.audio_file or not obj.audio_file.file:
            return None
        try:
            url = obj.audio_file.file.url
        except Exception:
            return None
        return request.build_absolute_uri(url) if request else url
