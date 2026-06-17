from django.urls import path

from .views import AboutUsSettingsView, ContactUsSettingsView

urlpatterns = [
    path("contact-us/", ContactUsSettingsView.as_view(), name="contact-us-settings"),
    path("about-us/", AboutUsSettingsView.as_view(), name="about-us-settings"),
]
