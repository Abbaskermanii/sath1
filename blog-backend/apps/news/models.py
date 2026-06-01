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


class Post(TimeStampedModel):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="news_posts",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="posts")

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)

    excerpt = models.CharField(max_length=300, blank=True)
    content = models.TextField()

    cover = models.ImageField(upload_to="posts/covers/", blank=True, null=True)

    status = models.CharField(
        max_length=20, choices=PostStatus.choices, default=PostStatus.DRAFT
    )
    published_at = models.DateTimeField(blank=True, null=True)

    views = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["status", "published_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title, allow_unicode=True)
            self.slug = base
            i = 1
            while Post.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                i += 1
                self.slug = f"{base}-{i}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Comment(TimeStampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="news_comments"
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
