from django.db import models
from django.core.exceptions import ValidationError


class Advertisement(models.Model):
    SLOT_HOME_MEDIUM_NEWS = "home_medium_news"
    SLOT_HOME_SIDEBAR = "home_sidebar"
    SLOT_HOME_BOTTOM = "home_bottom"

    SLOT_CHOICES = [
        (SLOT_HOME_MEDIUM_NEWS, "زیر اخبار میانی (وسط صفحه)"),
        (SLOT_HOME_SIDEBAR, "سایدبار (ستون کناری)"),
        (SLOT_HOME_BOTTOM, "پایین صفحه"),
    ]

    title = models.CharField(max_length=255, verbose_name="عنوان تبلیغ")
    description = models.TextField(blank=True, verbose_name="توضیحات")
    image = models.ImageField(upload_to="ads/", verbose_name="تصویر")
    label = models.CharField(max_length=50, default="تبلیغ", verbose_name="برچسب")
    button_text = models.CharField(
        max_length=50, default="مشاهده بیشتر", verbose_name="متن دکمه"
    )
    href = models.URLField(verbose_name="لینک مقصد")
    slot = models.CharField(
        max_length=50,
        choices=SLOT_CHOICES,
        unique=True,
        verbose_name="جایگاه",
    )
    is_active = models.BooleanField(default=True, verbose_name="فعال است؟")

    class Meta:
        verbose_name = "تبلیغ"
        verbose_name_plural = "تبلیغات"
        ordering = ["-id"]

    def __str__(self):
        return f"{self.title} - {self.get_slot_display()}"

    def clean(self):
        super().clean()

        if not self.title:
            raise ValidationError({"title": "عنوان تبلیغ الزامی است."})

        if not self.href:
            raise ValidationError({"href": "لینک مقصد الزامی است."})

    def save(self, *args, **kwargs):
        self.full_clean()

        old_image = None
        if self.pk:
            try:
                old_obj = Advertisement.objects.get(pk=self.pk)
                if old_obj.image and old_obj.image != self.image:
                    old_image = old_obj.image
            except Advertisement.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        if old_image:
            old_image.delete(save=False)

    def delete(self, *args, **kwargs):
        image = self.image
        super().delete(*args, **kwargs)
        if image:
            image.delete(save=False)
