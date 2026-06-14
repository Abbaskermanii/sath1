from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    ADMIN = "admin", _("Admin")
    AUTHOR = "author", _("Author")
    USER = "user", _("User")


class User(AbstractUser):
    ROLE_USER = "user"
    ROLE_AUTHOR = "author"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = (
        (ROLE_USER, "User"),
        (ROLE_AUTHOR, "Author"),
        (ROLE_ADMIN, "Admin"),
    )

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_USER,
    )

    def __str__(self):
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="profile"
    )
    image = models.ImageField(upload_to="profiles/", blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True)
    bio = models.CharField(max_length=255, blank=True)
    about = models.TextField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    instagram = models.URLField(blank=True)
    telegram = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile - {self.user.username}"