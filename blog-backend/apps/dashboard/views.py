from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.news.models import Comment, HomeHeroSelection, HomeHeroSlot, Post
from .permissions import IsAdminOnly, IsAdminOrAuthor
from .serializers import (
    DashboardPostSearchSerializer,
    HomeHeroSelectionBulkUpdateSerializer,
    HomeHeroSelectionItemSerializer,
)


def empty_home_hero_slot(slot):
    return {
        "slot": slot,
        "is_active": False,
        "post_id": None,
        "post_title": None,
        "post_slug": None,
        "post_status": None,
        "post_media_type": None,
        "post_type": None,
        "published_at": None,
        "cover": None,
    }


def ordered_home_hero_slots():
    return [
        HomeHeroSlot.MAIN,
        HomeHeroSlot.TOP_LEFT,
        HomeHeroSlot.BOTTOM_LEFT,
        HomeHeroSlot.BOTTOM_CENTER,
        HomeHeroSlot.BOTTOM_RIGHT,
    ]


def serialize_home_hero_results(request):
    selections = HomeHeroSelection.objects.select_related(
        "post",
        "post__author",
        "post__category",
    ).all()

    by_slot = {item.slot: item for item in selections}

    results = []

    for slot in ordered_home_hero_slots():
        obj = by_slot.get(slot)

        if obj:
            results.append(
                HomeHeroSelectionItemSerializer(
                    obj,
                    context={"request": request},
                ).data
            )
        else:
            results.append(empty_home_hero_slot(slot))

    return results


class OverviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrAuthor]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "role", None) == "admin"

        posts = Post.objects.all()

        if not is_admin:
            posts = posts.filter(author=user)

        data = {
            "posts": {
                "total": posts.filter(
                    Q(media_type="none") | Q(media_type="") | Q(media_type__isnull=True)
                ).count(),
                "draft": posts.filter(
                    Q(media_type="none")
                    | Q(media_type="")
                    | Q(media_type__isnull=True),
                    status="draft",
                ).count(),
                "published": posts.filter(
                    Q(media_type="none")
                    | Q(media_type="")
                    | Q(media_type__isnull=True),
                    status="published",
                ).count(),
                "views_sum": posts.filter(
                    Q(media_type="none") | Q(media_type="") | Q(media_type__isnull=True)
                ).aggregate(s=Sum("views"))["s"]
                or 0,
            },
            "videos": {
                "total": posts.filter(media_type="video").count(),
                "draft": posts.filter(media_type="video", status="draft").count(),
                "published": posts.filter(
                    media_type="video", status="published"
                ).count(),
                "views_sum": posts.filter(media_type="video").aggregate(s=Sum("views"))[
                    "s"
                ]
                or 0,
            },
            "podcasts": {
                "total": posts.filter(media_type="podcast").count(),
                "draft": posts.filter(media_type="podcast", status="draft").count(),
                "published": posts.filter(
                    media_type="podcast", status="published"
                ).count(),
                "listens_sum": posts.filter(media_type="podcast").aggregate(
                    s=Sum("views")
                )["s"]
                or 0,
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
      - type: post|video|podcast|all default=all
      - status: draft|published|archived optional
    """

    permission_classes = [IsAuthenticated, IsAdminOrAuthor]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "role", None) == "admin"

        content_type = request.query_params.get("type", "all")
        status_param = request.query_params.get("status")

        result = []

        base_qs = (
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
            base_qs = base_qs.filter(author=user)

        if status_param:
            base_qs = base_qs.filter(status=status_param)

        if content_type in ["all", "post"]:
            posts = base_qs.filter(
                Q(media_type="none") | Q(media_type="") | Q(media_type__isnull=True)
            ).order_by("-published_at", "-created_at")[:200]

            for p in posts:
                result.append(
                    {
                        "type": "post",
                        "id": p.id,
                        "title": p.title,
                        "slug": p.slug,
                        "excerpt": p.excerpt,
                        "cover": (
                            request.build_absolute_uri(p.cover.url)
                            if getattr(p, "cover", None)
                            else None
                        ),
                        "status": p.status,
                        "created_at": p.created_at,
                        "published_at": p.published_at,
                        "updated_at": p.updated_at,
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

        if content_type in ["all", "video"]:
            videos = base_qs.filter(media_type="video").order_by(
                "-published_at", "-created_at"
            )[:200]

            for v in videos:
                result.append(
                    {
                        "type": "video",
                        "id": v.id,
                        "title": v.title,
                        "slug": v.slug,
                        "excerpt": v.excerpt,
                        "cover": (
                            request.build_absolute_uri(v.cover.url)
                            if getattr(v, "cover", None)
                            else None
                        ),
                        "status": v.status,
                        "created_at": v.created_at,
                        "published_at": v.published_at,
                        "updated_at": v.updated_at,
                        "views": v.views or 0,
                        "comments_count": v.comments_count or 0,
                        "duration": getattr(v, "media_duration", 0) or 0,
                        "category": (
                            {
                                "id": v.category.id,
                                "title": v.category.title,
                                "slug": v.category.slug,
                            }
                            if v.category
                            else None
                        ),
                        "tags": [
                            {
                                "id": tag.id,
                                "title": tag.title,
                                "slug": tag.slug,
                            }
                            for tag in v.tags.all()
                        ],
                    }
                )

        if content_type in ["all", "podcast"]:
            podcasts = base_qs.filter(media_type="podcast").order_by(
                "-published_at", "-created_at"
            )[:200]

            for p in podcasts:
                result.append(
                    {
                        "type": "podcast",
                        "id": p.id,
                        "title": p.title,
                        "slug": p.slug,
                        "excerpt": p.excerpt,
                        "cover": (
                            request.build_absolute_uri(p.cover.url)
                            if getattr(p, "cover", None)
                            else None
                        ),
                        "status": p.status,
                        "created_at": p.created_at,
                        "published_at": p.published_at,
                        "updated_at": p.updated_at,
                        "views": p.views or 0,
                        "comments_count": p.comments_count or 0,
                        "listens": p.views or 0,
                        "duration": getattr(p, "media_duration", 0) or 0,
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


class HomeHeroManagementView(APIView):
    """
    GET  /api/dashboard/home-hero/
    POST /api/dashboard/home-hero/

    فقط ادمین می‌تواند مدیریت کند.
    """

    permission_classes = [IsAuthenticated, IsAdminOnly]

    def get(self, request):
        results = serialize_home_hero_results(request)

        return Response(
            {
                "count": len(results),
                "results": results,
            }
        )

    def post(self, request):
        serializer = HomeHeroSelectionBulkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data["items"]

        for item in items:
            slot = item["slot"]
            post_id = item.get("post_id")
            is_active = item.get("is_active", True)

            if post_id is None:
                HomeHeroSelection.objects.filter(slot=slot).delete()
                continue

            post = Post.objects.get(id=post_id)

            HomeHeroSelection.objects.update_or_create(
                slot=slot,
                defaults={
                    "post": post,
                    "is_active": is_active,
                },
            )

        results = serialize_home_hero_results(request)

        return Response(
            {
                "message": "Home hero updated successfully.",
                "count": len(results),
                "results": results,
            }
        )


class DashboardPostSearchView(APIView):
    """
    GET /api/dashboard/post-search/?q=...

    فقط ادمین.
    برای پیدا کردن پست‌ها جهت انتخاب در Hero Homepage.
    """

    permission_classes = [IsAuthenticated, IsAdminOnly]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        status_param = request.query_params.get("status")
        media_type = request.query_params.get("media_type")
        limit = int(request.query_params.get("limit", 20))
        limit = min(limit, 50)

        qs = Post.objects.select_related("author", "category").order_by(
            "-published_at",
            "-created_at",
        )

        if q:
            qs = qs.filter(
                Q(title__icontains=q) | Q(slug__icontains=q) | Q(excerpt__icontains=q)
            )

        if status_param:
            qs = qs.filter(status=status_param)

        if media_type:
            qs = qs.filter(media_type=media_type)

        qs = qs[:limit]

        serializer = DashboardPostSearchSerializer(
            qs,
            many=True,
            context={"request": request},
        )

        return Response(
            {
                "count": len(serializer.data),
                "results": serializer.data,
            }
        )
