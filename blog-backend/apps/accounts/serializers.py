from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import Profile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("username", "email", "full_name", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.role = "user"  # همه ثبت‌نامی‌ها پیش‌فرض user
        user.set_password(password)
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        email = attrs.get("email")
        password = attrs.get("password")

        if not username and not email:
            raise serializers.ValidationError("username or email is required.")

        if email and not username:
            try:
                user = User.objects.get(email=email)
                username = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials.")

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("User is inactive.")

        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "id",
            "image",
            "full_name",
            "bio",
            "about",
            "country",
            "instagram",
            "telegram",
            "twitter",
            "linkedin",
            "website",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class MeSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "full_name",
            "role",
            "is_staff",
            "is_superuser",
            "profile",
        )
        read_only_fields = (
            "id",
            "role",
            "is_staff",
            "is_superuser",
        )


class AdminUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "full_name",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "profile",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)

        # آپدیت اطلاعات یوزر
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # آپدیت پروفایل اگر ارسال شده باشد
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance