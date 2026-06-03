from rest_framework import serializers


class MyContentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    title = serializers.CharField()
    slug = serializers.CharField()
    status = serializers.CharField()
    views = serializers.IntegerField(required=False, default=0)
    listens = serializers.IntegerField(required=False, default=0)
    duration = serializers.IntegerField(required=False, default=0)
    published_at = serializers.DateTimeField(required=False, allow_null=True)
    updated_at = serializers.DateTimeField(required=False, allow_null=True)
    cover = serializers.CharField(required=False, allow_blank=True)
