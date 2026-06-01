from django.db import models


class Advertisement(models.Model):
    POSITION_HOME_MIDDLE = "home_middle"

    POSITION_CHOICES = (
        (POSITION_HOME_MIDDLE, "Home Middle"),
    )

    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to="ads/")
    text = models.CharField(max_length=255, null=True, blank=True)

    position = models.CharField(
        max_length=50,
        choices=POSITION_CHOICES,
        default=POSITION_HOME_MIDDLE,
    )

    is_active = models.BooleanField(default=True)

    order = models.PositiveIntegerField(default=0)

    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.title
