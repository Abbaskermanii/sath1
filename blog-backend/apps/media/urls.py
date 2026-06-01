from rest_framework.routers import DefaultRouter

from apps.media.views import PublicVideoViewSet, PublicPodcastViewSet

router = DefaultRouter()
router.register(r"videos", PublicVideoViewSet, basename="public-videos")
router.register(r"podcasts", PublicPodcastViewSet, basename="public-podcasts")

urlpatterns = router.urls
