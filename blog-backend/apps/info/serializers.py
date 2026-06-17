from rest_framework import serializers

from .models import AboutUsSettings, ContactUsSettings


class ContactUsSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUsSettings
        fields = [
            "title",
            "description",
            "phone",
            "mobile",
            "email",
            "ads_email",
            "work_days",
            "work_hours",
            "address",
            "map_embed_url",
            "instagram",
            "telegram",
            "whatsapp",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class AboutUsSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUsSettings
        fields = [
            "title",
            "subtitle",
            "description",
            "mission_title",
            "mission_text",
            "vision_title",
            "vision_text",
            "values_title",
            "values_text",
            "story_title",
            "story_text",
            "image_url",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]
