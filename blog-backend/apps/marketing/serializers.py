from django.conf import settings
from rest_framework import serializers
from .models import Advertisement


class AdvertisementSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    image_url = serializers.SerializerMethodField(read_only=True)
    slot_label = serializers.CharField(source="get_slot_display", read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            "id",
            "title",
            "description",
            "image",
            "image_url",
            "label",
            "button_text",
            "href",
            "slot",
            "slot_label",
            "is_active",
        ]

    def get_image_url(self, obj):
        if not obj.image:
            return None

        try:
            url = obj.image.url
        except Exception:
            return None

        internal = getattr(settings, "MINIO_INTERNAL_URL", "")
        public = getattr(settings, "MINIO_PUBLIC_URL", "")

        if internal and public and internal in url:
            return url.replace(internal, public)

        request = self.context.get("request")
        if request is not None and not (
            url.startswith("http://") or url.startswith("https://")
        ):
            return request.build_absolute_uri(url)

        return url

    def validate_title(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("عنوان تبلیغ الزامی است.")
        return value

    def validate_label(self, value):
        value = (value or "").strip()
        return value or "تبلیغ"

    def validate_button_text(self, value):
        value = (value or "").strip()
        return value or "مشاهده بیشتر"

    def validate_description(self, value):
        return (value or "").strip()

    def validate_image(self, value):
        if not value:
            return value

        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                "حجم تصویر نباید بیشتر از 5 مگابایت باشد."
            )

        allowed_types = {
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        }

        content_type = getattr(value, "content_type", None)
        if content_type and content_type not in allowed_types:
            raise serializers.ValidationError(
                "فرمت تصویر باید jpg، jpeg، png یا webp باشد."
            )

        return value

    def validate(self, attrs):
        instance = getattr(self, "instance", None)

        slot = attrs.get("slot")
        if slot is None and instance is not None:
            slot = instance.slot

        if slot:
            qs = Advertisement.objects.filter(slot=slot)
            if instance is not None:
                qs = qs.exclude(pk=instance.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    {"slot": "برای این جایگاه قبلاً یک تبلیغ ثبت شده است."}
                )

        return attrs
