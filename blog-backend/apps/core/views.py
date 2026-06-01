from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.news.models import Category, Post, PostStatus
from apps.news.serializers import CategoryListSerializer, PostSimpleSerializer
from apps.media.models import Video, Podcast
from apps.media.serializers import VideoListSerializer, PodcastListSerializer


class HomeAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        latest_news = Post.objects.filter(status=PostStatus.PUBLISHED).order_by(
            "-published_at", "-created_at"
        )[:10]
        featured_videos = Video.objects.filter(
            status="published", is_featured=True
        ).order_by("-published_at", "-created_at")[:6]
        latest_videos = Video.objects.filter(status="published").order_by(
            "-published_at", "-created_at"
        )[:6]
        featured_podcasts = Podcast.objects.filter(
            status="published", is_featured=True
        ).order_by("-published_at", "-created_at")[:6]
        categories = Category.objects.all().order_by("title")[:15]

        return Response(
            {
                "latest_news": PostSimpleSerializer(
                    latest_news, many=True, context={"request": request}
                ).data,
                "featured_videos": VideoListSerializer(
                    featured_videos, many=True, context={"request": request}
                ).data,
                "latest_videos": VideoListSerializer(
                    latest_videos, many=True, context={"request": request}
                ).data,
                "featured_podcasts": PodcastListSerializer(
                    featured_podcasts, many=True, context={"request": request}
                ).data,
                "categories": CategoryListSerializer(
                    categories, many=True, context={"request": request}
                ).data,
            }
        )
