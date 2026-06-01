from django.urls import path

from .views import (
    PodcastListCreateAPIView,
    PodcastDetailAPIView,
    PodcastCommentListCreateAPIView,
    PodcastCommentDetailAPIView,
    PodcastLikeToggleAPIView,
    PodcastBookmarkToggleAPIView,
    MyBookmarkedPodcastListAPIView,
    MyLikedPodcastListAPIView,
    LatestPodcastsAPIView,
    FeaturedPodcastsAPIView,
    RelatedPodcastsAPIView,
    PodcastCategoryLandingAPIView,
    PodcastTagLandingAPIView,
)

urlpatterns = [
    path("", PodcastListCreateAPIView.as_view(), name="podcast-list-create"),
    path("latest/", LatestPodcastsAPIView.as_view(), name="podcast-latest"),
    path("featured/", FeaturedPodcastsAPIView.as_view(), name="podcast-featured"),
    path("my-bookmarks/", MyBookmarkedPodcastListAPIView.as_view(), name="my-bookmarked-podcasts"),
    path("my-liked/", MyLikedPodcastListAPIView.as_view(), name="my-liked-podcasts"),
    path("categories/<slug:slug>/landing/", PodcastCategoryLandingAPIView.as_view(), name="podcast-category-landing"),
    path("tags/<slug:slug>/landing/", PodcastTagLandingAPIView.as_view(), name="podcast-tag-landing"),
    path("<slug:slug>/", PodcastDetailAPIView.as_view(), name="podcast-detail"),
    path("<slug:slug>/related/", RelatedPodcastsAPIView.as_view(), name="podcast-related"),
    path("<slug:slug>/like-toggle/", PodcastLikeToggleAPIView.as_view(), name="podcast-like-toggle"),
    path("<slug:slug>/bookmark-toggle/", PodcastBookmarkToggleAPIView.as_view(), name="podcast-bookmark-toggle"),
    path("<slug:slug>/comments/", PodcastCommentListCreateAPIView.as_view(), name="podcast-comments"),
    path("comments/<int:pk>/", PodcastCommentDetailAPIView.as_view(), name="podcast-comment-detail"),
]
