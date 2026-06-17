from django.contrib import admin

from .models import AboutUsSettings, ContactUsSettings


@admin.register(ContactUsSettings)
class ContactUsSettingsAdmin(admin.ModelAdmin):
    list_display = ["title", "email", "phone", "updated_at"]
    readonly_fields = ["updated_at"]


@admin.register(AboutUsSettings)
class AboutUsSettingsAdmin(admin.ModelAdmin):
    list_display = ["title", "subtitle", "updated_at"]
    readonly_fields = ["updated_at"]
