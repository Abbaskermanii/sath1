from django.db.models import Sum, Count, Q
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.news.models import (
    Comment,
    HomeHeroSelection,
    HomeHeroSlot,
    HomeVideoSelection,
    HomeVideoSlot,
    MediaType,
    Post,
    PostStatus,
)

from .permissions import IsAdminOnly, IsAdminOrAuthor
from .serializers import (
    DashboardPostSearchSerializer,
    HomeHeroSelectionBulkUpdateSerializer,
    HomeHeroSelectionItemSerializer,
    HomeVideoSelectionBulkUpdateSerializer,
    HomeVideoSelectionItemSerializer,
    build_dashboard_file_url,
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


def empty_home_video_slot(slot):
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
        "video_file": None,
        "embed_url": "",
        "media_duration": None,
    }


def ordered_home_video_slots():
    return [
        HomeVideoSlot.MAIN,
        HomeVideoSlot.TOP,
        HomeVideoSlot.MIDDLE,
        HomeVideoSlot.BOTTOM,
    ]


def serialize_home_video_results(request):
    selections = HomeVideoSelection.objects.select_related(
        "post",
        "post__author",
        "post__category",
    ).all()

    by_slot = {item.slot: item for item in selections}
    results = []

    for slot in ordered_home_video_slots():
        obj = by_slot.get(slot)

        if obj:
            results.append(
                HomeVideoSelectionItemSerializer(
                    obj,
                    context={"request": request},
                ).data
            )
        else:
            results.append(empty_home_video_slot(slot))

    return results


def get_post_content_q():
    return Q(media_type="none") | Q(media_type="") | Q(media_type__isnull=True)


def get_video_content_q():
    return Q(media_type="video")


def get_podcast_content_q():
    return Q(media_type="podcast")


def apply_owner_scope(queryset, user):
    is_admin = getattr(user, "role", None) == "admin"
    if is_admin:
        return queryset
    return queryset.filter(author=user)


def safe_int(value, default):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


class OverviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrAuthor]

    def get(self, request):
        user = request.user
        is_admin = getattr(user, "role", None) == "admin"

        qs = apply_owner_scope(Post.objects.all(), user)

        post_q = Q(media_type=MediaType.NONE)
        video_q = Q(media_type=MediaType.VIDEO)
        podcast_q = Q(media_type=MediaType.PODCAST)

        data = {
            "posts": {
                "total": qs.filter(post_q).count(),
                "draft": qs.filter(post_q, status=PostStatus.DRAFT).count(),
                "published": qs.filter(post_q, status=PostStatus.PUBLISHED).count(),
                "views_sum": qs.filter(post_q).aggregate(total=Sum("views"))["total"]
                or 0,
            },
            "videos": {
                "total": qs.filter(video_q).count(),
                "draft": qs.filter(video_q, status=PostStatus.DRAFT).count(),
                "published": qs.filter(video_q, status=PostStatus.PUBLISHED).count(),
                "views_sum": qs.filter(video_q).aggregate(total=Sum("views"))["total"]
                or 0,
            },
            "podcasts": {
                "total": qs.filter(podcast_q).count(),
                "draft": qs.filter(podcast_q, status=PostStatus.DRAFT).count(),
                "published": qs.filter(podcast_q, status=PostStatus.PUBLISHED).count(),
                "listens_sum": qs.filter(podcast_q).aggregate(total=Sum("views"))[
                    "total"
                ]
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

        base_qs = apply_owner_scope(base_qs, user)

        if status_param:
            base_qs = base_qs.filter(status=status_param)

        def serialize_item(obj, item_type):
            return {
                "type": item_type,
                "id": obj.id,
                "title": obj.title,
                "slug": obj.slug,
                "excerpt": obj.excerpt,
                "cover": build_dashboard_file_url(getattr(obj, "cover", None), request),
                "status": obj.status,
                "post_type": obj.post_type,
                "media_type": obj.media_type,
                "created_at": obj.created_at,
                "published_at": obj.published_at,
                "updated_at": obj.updated_at,
                "views": obj.views or 0,
                "comments_count": obj.comments_count or 0,
                "duration": getattr(obj, "media_duration", 0) or 0,
                "listens": (obj.views or 0) if item_type == "podcast" else 0,
                "category": (
                    {
                        "id": obj.category.id,
                        "title": obj.category.title,
                        "slug": obj.category.slug,
                    }
                    if obj.category
                    else None
                ),
                "tags": [
                    {
                        "id": tag.id,
                        "title": tag.title,
                        "slug": tag.slug,
                    }
                    for tag in obj.tags.all()
                ],
            }

        if content_type in ["all", "post"]:
            posts = base_qs.filter(get_post_content_q()).order_by(
                "-published_at", "-created_at"
            )[:200]
            result.extend([serialize_item(p, "post") for p in posts])

        if content_type in ["all", "video"]:
            videos = base_qs.filter(get_video_content_q()).order_by(
                "-published_at", "-created_at"
            )[:200]
            result.extend([serialize_item(v, "video") for v in videos])

        if content_type in ["all", "podcast"]:
            podcasts = base_qs.filter(get_podcast_content_q()).order_by(
                "-published_at", "-created_at"
            )[:200]
            result.extend([serialize_item(p, "podcast") for p in podcasts])

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
                    "post_title": c.post.title if c.post else None,
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
    """

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminOnly()]

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


class HomeVideoManagementView(APIView):
    """
    GET  /api/dashboard/home-video/
    POST /api/dashboard/home-video/
    """

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminOnly()]

    def get(self, request):
        results = serialize_home_video_results(request)

        return Response(
            {
                "count": len(results),
                "results": results,
            }
        )

    def post(self, request):
        serializer = HomeVideoSelectionBulkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data["items"]

        for item in items:
            slot = item["slot"]
            post_id = item.get("post_id")
            is_active = item.get("is_active", True)

            if post_id is None:
                HomeVideoSelection.objects.filter(slot=slot).delete()
                continue

            post = Post.objects.get(id=post_id)

            HomeVideoSelection.objects.update_or_create(
                slot=slot,
                defaults={
                    "post": post,
                    "is_active": is_active,
                },
            )

        results = serialize_home_video_results(request)

        return Response(
            {
                "message": "Home video slots updated successfully.",
                "count": len(results),
                "results": results,
            }
        )


class DashboardPostSearchView(APIView):
    """
    GET /api/dashboard/post-search/?q=...
    """

    permission_classes = [IsAuthenticated, IsAdminOnly]

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        status_param = request.query_params.get("status")
        media_type = request.query_params.get("media_type")
        limit = safe_int(request.query_params.get("limit", 20), 20)
        limit = min(max(limit, 1), 50)

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
            if media_type == "post":
                qs = qs.filter(get_post_content_q())
            else:
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
