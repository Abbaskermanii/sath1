from rest_framework import serializers

from .models import Category, Tag, News, Comment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "created_at",
            "updated_at",
        ]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = [
            "id",
            "name",
            "slug",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "created_at",
            "updated_at",
        ]


class CommentReplySerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "created_at",
            "updated_at",
        ]


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    replies = CommentReplySerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "parent",
            "content",
            "replies",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "replies",
            "created_at",
            "updated_at",
        ]

    def validate_parent(self, value):
        if value and value.parent_id is not None:
            raise serializers.ValidationError("Reply to a reply is not allowed.")
        return value

    def validate(self, attrs):
        parent = attrs.get("parent")
        news = self.context.get("news")

        if parent and news and parent.news_id != news.id:
            raise serializers.ValidationError(
                {"parent": "Parent comment must belong to the same news."}
            )

        return attrs


class NewsListSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    bookmarks_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True)
    is_bookmarked = serializers.BooleanField(read_only=True)

    class Meta:
        model = News
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "image",
            "status",
            "is_featured",
            "views_count",
            "published_at",
            "author",
            "category",
            "tags",
            "comments_count",
            "likes_count",
            "bookmarks_count",
            "is_liked",
            "is_bookmarked",
            "created_at",
        ]


class NewsDetailSerializer(serializers.ModelSerializer):
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
        model = News
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "image",
            "status",
            "is_featured",
            "views_count",
            "published_at",
            "author",
            "category",
            "tags",
            "comments",
            "comments_count",
            "likes_count",
            "bookmarks_count",
            "is_liked",
            "is_bookmarked",
            "created_at",
            "updated_at",
        ]


class NewsWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = [
            "id",
            "title",
            "summary",
            "content",
            "image",
            "status",
            "is_featured",
            "category",
            "tags",
        ]
        read_only_fields = ["id"]

    def validate_tags(self, value):
        if value and len(value) > 10:
            raise serializers.ValidationError(
                "You can not add more than 10 tags to a news item."
            )
        return value


class CategoryHeadlineSerializer(serializers.Serializer):
    category = CategorySerializer()
    headline_news = NewsListSerializer(allow_null=True)


class RelatedNewsByTagSerializer(serializers.Serializer):
    tag = TagSerializer()
    news = NewsListSerializer(many=True)


class CategoryLatestNewsSerializer(serializers.Serializer):
    category = CategorySerializer()
    latest_news = NewsListSerializer(many=True)


class TagWithCountSerializer(serializers.ModelSerializer):
    news_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tag
        fields = [
            "id",
            "name",
            "slug",
            "news_count",
        ]


class HomePageSerializer(serializers.Serializer):
    headline_news_by_category = CategoryHeadlineSerializer(many=True)
    latest_news = NewsListSerializer(many=True)
    latest_news_per_category = CategoryLatestNewsSerializer(many=True)
    popular_tags = TagWithCountSerializer(many=True)
    tags_with_count = TagWithCountSerializer(many=True)


class NewsByTagGroupSerializer(serializers.Serializer):
    tag = TagSerializer()
    latest_news = NewsListSerializer(many=True)


class CategoryLandingSerializer(serializers.Serializer):
    context = serializers.DictField()
    headline_news = NewsListSerializer(allow_null=True)
    latest_news = NewsListSerializer(many=True)
    popular_tags = TagWithCountSerializer(many=True)
    tags_with_count = TagWithCountSerializer(many=True)
    news_by_tag = NewsByTagGroupSerializer(many=True)
