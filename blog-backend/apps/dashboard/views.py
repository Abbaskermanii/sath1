from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.news.models import Post, Comment
from apps.media.models import Video, Podcast

from .permissions import IsAdminOrAuthor


class OverviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrAuthor]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "role", None) == "admin"

        posts = Post.objects.all()
        videos = Video.objects.all()
        podcasts = Podcast.objects.all()

        if not is_admin:
            posts = posts.filter(author=user)
            videos = videos.filter(author=user)
            podcasts = podcasts.filter(author=user)

        data = {
            "posts": {
                "total": posts.count(),
                "draft": posts.filter(status="draft").count(),
                "published": posts.filter(status="published").count(),
                "views_sum": posts.aggregate(s=Sum("views"))["s"] or 0,
            },
            "videos": {
                "total": videos.count(),
                "draft": videos.filter(status="draft").count(),
                "published": videos.filter(status="published").count(),
                "views_sum": videos.aggregate(s=Sum("views_count"))["s"] or 0,
            },
            "podcasts": {
                "total": podcasts.count(),
                "draft": podcasts.filter(status="draft").count(),
                "published": podcasts.filter(status="published").count(),
                "listens_sum": podcasts.aggregate(s=Sum("listens_count"))["s"] or 0,
            },
        }

        if is_admin:
            data["comments"] = {
                "pending_total": Comment.objects.filter(is_approved=False).count(),
                "approved_total": Comment.objects.filter(is_approved=True).count(),
            }

        return Response(data)


class MyContentView(APIView):
    """
    یک endpoint یکپارچه برای محتواهای کاربر.
    Query params:
      - type: post|video|podcast|all (default=all)
      - status: draft|published|archived (اختیاری)
    """

    permission_classes = [IsAuthenticated, IsAdminOrAuthor]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "role", None) == "admin"

        content_type = request.query_params.get("type", "all")
        status = request.query_params.get("status")

        result = []

        def add_posts():
            qs = Post.objects.all()
            if not is_admin:
                qs = qs.filter(author=user)
            if status:
                qs = qs.filter(status=status)

            for p in qs.order_by("-published_at", "-created_at")[:200]:
                result.append(
                    {
                        "type": "post",
                        "id": p.id,
                        "title": p.title,
                        "status": p.status,
                        "created_at": p.created_at,
                        "published_at": p.published_at,
                        "views": p.views,
                    }
                )

        def add_videos():
            qs = Video.objects.all()
            if not is_admin:
                qs = qs.filter(author=user)
            if status:
                qs = qs.filter(status=status)

            for v in qs.order_by("-published_at", "-created_at")[:200]:
                result.append(
                    {
                        "type": "video",
                        "id": v.id,
                        "title": v.title,
                        "status": v.status,
                        "created_at": v.created_at,
                        "published_at": v.published_at,
                        "views": v.views_count,
                    }
                )

        def add_podcasts():
            qs = Podcast.objects.all()
            if not is_admin:
                qs = qs.filter(author=user)
            if status:
                qs = qs.filter(status=status)

            for p in qs.order_by("-published_at", "-created_at")[:200]:
                result.append(
                    {
                        "type": "podcast",
                        "id": p.id,
                        "title": p.title,
                        "status": p.status,
                        "created_at": p.created_at,
                        "published_at": p.published_at,
                        "listens": p.listens_count,
                    }
                )

        if content_type in ["all", "post"]:
            add_posts()
        if content_type in ["all", "video"]:
            add_videos()
        if content_type in ["all", "podcast"]:
            add_podcasts()

        result.sort(
            key=lambda x: (
                x["published_at"] is not None,
                x["published_at"] or x["created_at"],
            ),
            reverse=True,
        )

        return Response(
            {
                "count": len(result),
                "results": result,
            }
        )


class PendingCommentsModerationView(APIView):
    """
    کامنت‌های در انتظار تایید.
    - ادمین: همه pending ها
    - نویسنده: pending های پست‌های خودش
    """

    permission_classes = [IsAuthenticated, IsAdminOrAuthor]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "role", None) == "admin"

        qs = Comment.objects.select_related("post", "user").filter(is_approved=False)

        if not is_admin:
            qs = qs.filter(post__author=user)

        qs = qs.order_by("-created_at")[:300]

        data = []
        for c in qs:
            data.append(
                {
                    "id": c.id,
                    "post_id": c.post_id,
                    "post_title": c.post.title,
                    "user_id": c.user_id,
                    "user": str(c.user) if c.user else None,
                    "text": c.text,
                    "created_at": c.created_at,
                }
            )

        return Response({"count": len(data), "results": data})
