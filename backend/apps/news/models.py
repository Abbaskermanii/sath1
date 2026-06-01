from django.db import models
from django.utils.text import slugify
from django.conf import settings
from shortuuid import uuid
from django.db import models


class Category(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=150)

    # هر دسته‌بندی یک خبر تیتر مهم دارد
    headline_post = models.ForeignKey(
        "Post",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="headline_for_categories",
    )

    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["order", "title"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Tag(models.Model):
    title = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, max_length=150)

    # تگ داغ
    is_hot = models.BooleanField(default=False)

    # ادمین مشخص کند این تگ در هوم نمایش داده شود
    show_in_home = models.BooleanField(default=False)

    # برای کنترل ترتیب تگ‌های هوم
    home_order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["home_order", "title"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Post(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_DRAFT = "draft"
    STATUS_DISABLED = "disabled"

    STATUS_CHOICES = (
        (STATUS_ACTIVE, "Active"),
        (STATUS_DRAFT, "Draft"),
        (STATUS_DISABLED, "Disabled"),
    )

    TYPE_NEWS = "news"
    TYPE_ARTICLE = "article"
    TYPE_ANALYSIS = "analysis"

    POST_TYPE_CHOICES = (
        (TYPE_NEWS, "News"),
        (TYPE_ARTICLE, "Article"),
        (TYPE_ANALYSIS, "Analysis"),
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=280, null=True, blank=True)

    image = models.ImageField(upload_to="posts/", null=True, blank=True)

    description = models.TextField(null=True, blank=True)
    excerpt = models.TextField(null=True, blank=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="posts",
    )

    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name="posts",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
    )

    post_type = models.CharField(
        max_length=20,
        choices=POST_TYPE_CHOICES,
        default=TYPE_NEWS,
    )

    # برای هوم
    is_featured = models.BooleanField(default=False)

    # خبر فوری
    is_breaking = models.BooleanField(default=False)

    # خبر داغ دستی
    is_hot = models.BooleanField(default=False)

    # اگر بخواهیم از نمایش در هوم حذفش کنیم
    show_in_home = models.BooleanField(default=True)

    view = models.PositiveIntegerField(default=0)

    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name="liked_posts",
    )

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = f"{base_slug}-{uuid()[:6]}"
        super().save(*args, **kwargs)


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    comment = models.TextField()
    reply = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.post.title} - {self.name}"

    class Meta:
        verbose_name_plural = "Comment"


class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.post.title} - {self.user.username}"

    class Meta:
        verbose_name_plural = "Bookmark"


class Notification(models.Model):
    NOTI_TYPE = (("Like", "Like"), ("Comment", "Comment"), ("Bookmark", "Bookmark"))
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    type = models.CharField(max_length=100, choices=NOTI_TYPE)
    seen = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Notification"

    def __str__(self):
        if self.post:
            return f"{self.type} - {self.post.title}"
        else:
            return "Notification"
