from django.conf import settings
from django.db import models
from django.utils.text import slugify


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimeStampedModel):
    title = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)

    class Meta:
        ordering = ("title",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Tag(TimeStampedModel):
    title = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        ordering = ("title",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PostStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"


class PostType(models.TextChoices):
    FEATURED_TALK = "featured_talk", "گفتگوهای شاخص"
    INTERVIEW = "interview", "مصاحبه"
    NOTE = "note", "یادداشت"
    VIDEO_CALL = "video_call", "ارتباط تصویری"
    NEWS = "news", "خبر"
    ANALYSIS = "analysis", "تحلیل"
    REPORT = "report", "گزارش"
    CHART = "chart", "نمودار"


class HomepageSection(models.TextChoices):
    NONE = "none", "None"
    HERO = "hero", "Hero"
    TOP_STORIES = "top_stories", "Top Stories"
    LATEST = "latest", "Latest"
    OPINION = "opinion", "Opinion"
    EXPLAINERS = "explainers", "Explainers"
    HOW_TO = "how_to", "How To"
    MARKET = "market", "Market"
    BUSINESS = "business", "Business"
    CULTURE = "culture", "Culture"
    WORK_LIFE = "work_life", "Work & Life"
    GREEN = "green", "Green"


class MediaType(models.TextChoices):
    NONE = "none", "بدون رسانه"
    VIDEO = "video", "ویدیو"
    PODCAST = "podcast", "پادکست"


class Post(TimeStampedModel):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="news_posts",
    )

    category = models.ForeignKey(
        "news.Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
    )

    tags = models.ManyToManyField("news.Tag", blank=True, related_name="posts")

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)

    excerpt = models.CharField(max_length=300, blank=True)
    content = models.TextField()

    cover = models.ImageField(upload_to="posts/covers/", blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=PostStatus.choices,
        default=PostStatus.DRAFT,
    )

    post_type = models.CharField(
        max_length=30,
        choices=PostType.choices,
        default=PostType.NEWS,
        db_index=True,
    )

    media_type = models.CharField(
        max_length=20,
        choices=MediaType.choices,
        default=MediaType.NONE,
        db_index=True,
    )

    video_file = models.FileField(upload_to="posts/videos/", blank=True, null=True)
    audio_file = models.FileField(upload_to="posts/audios/", blank=True, null=True)
    embed_url = models.URLField(blank=True)
    media_duration = models.PositiveIntegerField(blank=True, null=True)

    published_at = models.DateTimeField(blank=True, null=True)

    views = models.PositiveIntegerField(default=0)

    is_featured = models.BooleanField(default=False, db_index=True)
    is_hero = models.BooleanField(default=False, db_index=True)
    show_on_homepage = models.BooleanField(default=False, db_index=True)

    homepage_section = models.CharField(
        max_length=40,
        choices=HomepageSection.choices,
        default=HomepageSection.NONE,
        db_index=True,
    )

    homepage_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("-published_at", "-created_at")
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["status", "post_type"]),
            models.Index(fields=["status", "media_type"]),
            models.Index(fields=["status", "is_featured"]),
            models.Index(fields=["status", "is_hero"]),
            models.Index(
                fields=["show_on_homepage", "homepage_section", "homepage_order"]
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title, allow_unicode=False)
            if not base:
                base = "post"

            slug = base
            i = 1

            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                i += 1
                slug = f"{base}-{i}"

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Comment(TimeStampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="news_comments",
    )
    text = models.TextField()

    is_approved = models.BooleanField(default=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Comment({self.post_id}, {self.user_id})"


class Bookmark(TimeStampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="bookmarks")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="news_bookmarks",
    )

    class Meta:
        unique_together = ("post", "user")
        ordering = ("-created_at",)

    def __str__(self):
        return f"Bookmark({self.post_id}, {self.user_id})"
