from django.conf import settings
from django.db import models
from django.utils.text import slugify

from apps.news.models import Category, Tag  # <-- reuse news taxonomy


class MediaFile(models.Model):
    FILE_TYPE_CHOICES = (
        ("image", "Image"),
        ("audio", "Audio"),
        ("video", "Video"),
        ("document", "Document"),
        ("other", "Other"),
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="uploads/%Y/%m/%d/")
    alt_text = models.CharField(max_length=255, blank=True)
    file_type = models.CharField(
        max_length=20, choices=FILE_TYPE_CHOICES, default="other"
    )
    mime_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveBigIntegerField(null=True, blank=True)

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="media_files",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.file_type})"


class Video(models.Model):
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)

    # use same news Category/Tag
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="videos"
    )
    tags = models.ManyToManyField(Tag, related_name="videos", blank=False)

    video_file = models.ForeignKey(
        MediaFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="video_items",
        limit_choices_to={"file_type": "video"},
    )
    thumbnail = models.ForeignKey(
        MediaFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="video_thumbnails",
        limit_choices_to={"file_type": "image"},
    )
    embed_url = models.URLField(blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="videos",
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Podcast(models.Model):
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)

    # use same news Category/Tag
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="podcasts"
    )
    tags = models.ManyToManyField(Tag, related_name="podcasts", blank=False)

    audio_file = models.ForeignKey(
        MediaFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="podcast_items",
        limit_choices_to={"file_type": "audio"},
    )
    cover_image = models.ForeignKey(
        MediaFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="podcast_covers",
        limit_choices_to={"file_type": "image"},
    )

    duration = models.PositiveIntegerField(null=True, blank=True)

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="podcasts",
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    is_featured = models.BooleanField(default=False)
    listens_count = models.PositiveIntegerField(default=0)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
