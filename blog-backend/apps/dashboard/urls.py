from django.urls import path

from .views import (
    DashboardPostSearchView,
    HomeHeroManagementView,
    HomeVideoManagementView,
    MyContentView,
    OverviewView,
    PendingCommentsModerationView,
)

urlpatterns = [
    path("overview/", OverviewView.as_view(), name="dashboard-overview"),
    path("my-content/", MyContentView.as_view(), name="dashboard-my-content"),
    path(
        "pending-comments/",
        PendingCommentsModerationView.as_view(),
        name="dashboard-pending-comments",
    ),
    path(
        "home-hero/",
        HomeHeroManagementView.as_view(),
        name="dashboard-home-hero",
    ),
    path(
        "home-video/",
        HomeVideoManagementView.as_view(),
        name="dashboard-home-video",
    ),
    path(
        "post-search/",
        DashboardPostSearchView.as_view(),
        name="dashboard-post-search",
    ),
]
