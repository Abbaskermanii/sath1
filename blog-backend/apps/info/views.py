from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AboutUsSettings, ContactUsSettings
from .serializers import AboutUsSettingsSerializer, ContactUsSettingsSerializer


class ContactUsSettingsView(APIView):
    def get_permissions(self):
        if self.request.method in ["PATCH", "PUT"]:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_object(self):
        obj, _ = ContactUsSettings.objects.get_or_create(
            id=1,
            defaults={
                "title": "تماس با ما",
                "description": "برای ارتباط با ما از اطلاعات این صفحه استفاده کنید.",
            },
        )
        return obj

    def get(self, request, *args, **kwargs):
        contact_settings = self.get_object()
        serializer = ContactUsSettingsSerializer(contact_settings)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        contact_settings = self.get_object()
        serializer = ContactUsSettingsSerializer(
            contact_settings,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        contact_settings = self.get_object()
        serializer = ContactUsSettingsSerializer(
            contact_settings,
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AboutUsSettingsView(APIView):
    def get_permissions(self):
        if self.request.method in ["PATCH", "PUT"]:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_object(self):
        obj, _ = AboutUsSettings.objects.get_or_create(
            id=1,
            defaults={
                "title": "درباره ما",
                "subtitle": "شاخص‌یک، رسانه‌ای برای دسترسی سریع و دقیق به اطلاعات.",
                "description": "ما تلاش می‌کنیم محتوایی دقیق، کاربردی و قابل اعتماد ارائه کنیم.",
                "mission_title": "ماموریت ما",
                "mission_text": "ماموریت ما ارائه اطلاعات شفاف، سریع و قابل اتکا برای کاربران است.",
                "vision_title": "چشم‌انداز ما",
                "vision_text": "چشم‌انداز ما تبدیل شدن به یکی از منابع معتبر اطلاع‌رسانی و تحلیل است.",
                "values_title": "ارزش‌های ما",
                "values_text": "دقت، شفافیت، مسئولیت‌پذیری و احترام به مخاطب از ارزش‌های اصلی ماست.",
                "story_title": "داستان ما",
                "story_text": "شاخص‌یک با هدف ساده‌تر کردن دسترسی کاربران به اطلاعات مفید شکل گرفت.",
            },
        )
        return obj

    def get(self, request, *args, **kwargs):
        about_settings = self.get_object()
        serializer = AboutUsSettingsSerializer(about_settings)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        about_settings = self.get_object()
        serializer = AboutUsSettingsSerializer(
            about_settings,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        about_settings = self.get_object()
        serializer = AboutUsSettingsSerializer(
            about_settings,
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
