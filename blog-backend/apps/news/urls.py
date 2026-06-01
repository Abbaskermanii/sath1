from rest_framework.routers import DefaultRouter

from apps.news.views import (
    BookmarkViewSet,
    CategoryViewSet,
    CommentViewSet,
    PostViewSet,
    TagViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="news-category")
router.register("tags", TagViewSet, basename="news-tag")
router.register("posts", PostViewSet, basename="news-post")
router.register("comments", CommentViewSet, basename="news-comment")
router.register("bookmarks", BookmarkViewSet, basename="news-bookmark")

urlpatterns = router.urls
