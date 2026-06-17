from django.db import models


class ContactUsSettings(models.Model):
    title = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")

    phone = models.CharField(max_length=100, blank=True, default="")
    mobile = models.CharField(max_length=100, blank=True, default="")

    email = models.EmailField(blank=True, default="")
    ads_email = models.EmailField(blank=True, default="")

    work_days = models.CharField(max_length=255, blank=True, default="")
    work_hours = models.CharField(max_length=255, blank=True, default="")

    address = models.TextField(blank=True, default="")
    map_embed_url = models.URLField(max_length=500, blank=True, default="")

    instagram = models.CharField(max_length=255, blank=True, default="")
    telegram = models.CharField(max_length=255, blank=True, default="")
    whatsapp = models.CharField(max_length=255, blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Contact Us Settings"
        verbose_name_plural = "Contact Us Settings"

    def __str__(self):
        return self.title or "Contact Us Settings"


class AboutUsSettings(models.Model):
    title = models.CharField(max_length=255, blank=True, default="")
    subtitle = models.CharField(max_length=500, blank=True, default="")
    description = models.TextField(blank=True, default="")

    mission_title = models.CharField(max_length=255, blank=True, default="")
    mission_text = models.TextField(blank=True, default="")

    vision_title = models.CharField(max_length=255, blank=True, default="")
    vision_text = models.TextField(blank=True, default="")

    values_title = models.CharField(max_length=255, blank=True, default="")
    values_text = models.TextField(blank=True, default="")

    story_title = models.CharField(max_length=255, blank=True, default="")
    story_text = models.TextField(blank=True, default="")

    image_url = models.URLField(max_length=500, blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "About Us Settings"
        verbose_name_plural = "About Us Settings"

    def __str__(self):
        return self.title or "About Us Settings"
