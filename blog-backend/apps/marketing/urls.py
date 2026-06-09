from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdvertisementViewSet, active_ads_api

router = DefaultRouter()
router.register(r"ads", AdvertisementViewSet, basename="marketing-ads")

urlpatterns = [
    path("public-ads/", active_ads_api, name="active-ads"),
    path("", include(router.urls)),
]
