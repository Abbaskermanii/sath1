from django.urls import path
from .views import OverviewView, MyContentView, PendingCommentsModerationView

app_name = "dashboard"

urlpatterns = [
    path("overview/", OverviewView.as_view(), name="overview"),
    path("my-content/", MyContentView.as_view(), name="my-content"),
    path(
        "moderation/comments/",
        PendingCommentsModerationView.as_view(),
        name="pending-comments",
    ),
]
