from django.db import models
from django.conf import settings
from django.utils.text import slugify
from shortuuid import uuid
from apps.news.models import Category, Tag


class Video(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_DRAFT = "draft"
    STATUS_DISABLED = "disabled"

    STATUS_CHOICES = (
        (STATUS_ACTIVE, "Active"),
        (STATUS_DRAFT, "Draft"),
        (STATUS_DISABLED, "Disabled"),
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="videos",
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=280, null=True, blank=True)

    thumbnail = models.ImageField(upload_to="videos/thumbnails/", null=True, blank=True)

    # طبق خواسته تو: هم فایل، هم لینک
    video_file = models.FileField(upload_to="videos/files/", null=True, blank=True)
    video_url = models.URLField(null=True, blank=True)

    description = models.TextField(null=True, blank=True)
    excerpt = models.TextField(null=True, blank=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="videos",
    )

    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name="videos",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
    )

    # ویدیوی پیشنهادی
    is_suggested = models.BooleanField(default=False)

    # ویدیوی مهم / ویژه
    is_featured = models.BooleanField(default=False)

    # برای نمایش در هوم
    show_in_home = models.BooleanField(default=False)

    views = models.PositiveIntegerField(default=0)
    duration = models.CharField(max_length=30, null=True, blank=True)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = f"{slugify(self.title)}-{uuid()[:6]}"
        super().save(*args, **kwargs)


class Podcast(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_DRAFT = "draft"
    STATUS_DISABLED = "disabled"

    STATUS_CHOICES = (
        (STATUS_ACTIVE, "Active"),
        (STATUS_DRAFT, "Draft"),
        (STATUS_DISABLED, "Disabled"),
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="podcasts",
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=280, null=True, blank=True)

    cover = models.ImageField(upload_to="podcasts/covers/", null=True, blank=True)

    # طبق جواب تو: پادکست فقط فایل دارد
    audio_file = models.FileField(upload_to="podcasts/files/")

    description = models.TextField(null=True, blank=True)
    excerpt = models.TextField(null=True, blank=True)

    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name="podcasts",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
    )

    is_suggested = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    show_in_home = models.BooleanField(default=False)

    listens = models.PositiveIntegerField(default=0)
    duration = models.CharField(max_length=30, null=True, blank=True)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = f"{slugify(self.title)}-{uuid()[:6]}"
        super().save(*args, **kwargs)
