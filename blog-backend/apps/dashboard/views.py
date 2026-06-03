from django.db.models import Sum, Count, Q
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
    GET /api/dashboard/my-content/

    Query params:
      - type: post|video|podcast|all (default=all)
      - status: draft|published|archived (optional)
    """

    permission_classes = [IsAuthenticated, IsAdminOrAuthor]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "role", None) == "admin"

        content_type = request.query_params.get("type", "all")
        status_param = request.query_params.get("status")

        result = []

        # ✅ POSTS
        if content_type in ["all", "post"]:
            posts = (
                Post.objects.select_related("author", "category")
                .prefetch_related("tags")
                .annotate(
                    comments_count=Count(
                        "comments",
                        filter=Q(comments__is_approved=True),
                        distinct=True,
                    )
                )
            )

            if not is_admin:
                posts = posts.filter(author=user)

            if status_param:
                posts = posts.filter(status=status_param)

            posts = posts.order_by("-published_at", "-created_at")[:200]

            for p in posts:
                result.append(
                    {
                        "type": "post",
                        "id": p.id,
                        "title": p.title,
                        "slug": p.slug,
                        "excerpt": p.excerpt,
                        "cover": (
                            request.build_absolute_uri(p.cover.url) if p.cover else None
                        ),
                        "status": p.status,
                        "created_at": p.created_at,
                        "published_at": p.published_at,
                        "views": p.views or 0,
                        "comments_count": p.comments_count or 0,
                        "category": (
                            {
                                "id": p.category.id,
                                "title": p.category.title,
                                "slug": p.category.slug,
                            }
                            if p.category
                            else None
                        ),
                        "tags": [
                            {
                                "id": tag.id,
                                "title": tag.title,
                                "slug": tag.slug,
                            }
                            for tag in p.tags.all()
                        ],
                    }
                )

        # ✅ VIDEOS
        if content_type in ["all", "video"]:
            videos = Video.objects.all()

            if not is_admin:
                videos = videos.filter(author=user)

            if status_param:
                videos = videos.filter(status=status_param)

            videos = videos.order_by("-published_at", "-created_at")[:200]

            for v in videos:
                result.append(
                    {
                        "type": "video",
                        "id": v.id,
                        "title": v.title,
                        "slug": v.slug,
                        "status": v.status,
                        "created_at": v.created_at,
                        "published_at": v.published_at,
                        "views": v.views_count or 0,
                        "duration": getattr(v, "duration", 0),
                    }
                )

        # ✅ PODCASTS
        if content_type in ["all", "podcast"]:
            podcasts = Podcast.objects.all()

            if not is_admin:
                podcasts = podcasts.filter(author=user)

            if status_param:
                podcasts = podcasts.filter(status=status_param)

            podcasts = podcasts.order_by("-published_at", "-created_at")[:200]

            for p in podcasts:
                result.append(
                    {
                        "type": "podcast",
                        "id": p.id,
                        "title": p.title,
                        "slug": p.slug,
                        "status": p.status,
                        "created_at": p.created_at,
                        "published_at": p.published_at,
                        "listens": p.listens_count or 0,
                        "duration": getattr(p, "duration", 0),
                    }
                )

        # ✅ sort unified (latest first)
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
