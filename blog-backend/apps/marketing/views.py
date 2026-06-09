from rest_framework import filters, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Advertisement
from .serializers import AdvertisementSerializer
from .permissions import IsAdminOrReadOnly


@api_view(["GET"])
@permission_classes([AllowAny])
def active_ads_api(request):
    queryset = Advertisement.objects.filter(is_active=True).order_by("id")
    serializer = AdvertisementSerializer(
        queryset,
        many=True,
        context={"request": request},
    )

    data = {item["slot"]: item for item in serializer.data}

    return Response(data, status=status.HTTP_200_OK)


class AdvertisementViewSet(viewsets.ModelViewSet):
    serializer_class = AdvertisementSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "label", "href"]
    ordering_fields = ["id", "title", "slot", "is_active"]
    ordering = ["-id"]

    def get_queryset(self):
        return Advertisement.objects.all().order_by("-id")

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
