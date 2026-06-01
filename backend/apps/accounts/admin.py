from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = [
        "id",
        "email",
        "username",
        "full_name",
        "role",
        "is_staff",
        "is_superuser",
    ]
    list_filter = ["role", "is_staff", "is_superuser"]
    search_fields = ["email", "username", "full_name"]

    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {"fields": ("full_name", "role", "otp", "reset_token")}),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "full_name", "country", "created_at"]
    search_fields = ["user__email", "full_name"]
