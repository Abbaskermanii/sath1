from rest_framework import permissions

WRITERS_GROUP_NAME = "writers"


def is_admin(user):
    return user and user.is_authenticated and (user.is_staff or user.is_superuser)


def is_writer(user):
    return (
        user
        and user.is_authenticated
        and user.groups.filter(name=WRITERS_GROUP_NAME).exists()
    )


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user)


class IsAdminOrWriterCanCreateAuthorOrAdminCanEdit(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.method == "POST":
            return is_admin(request.user) or is_writer(request.user)

        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return is_admin(request.user) or obj.author_id == request.user.id


class IsCommentAuthorOrAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.method == "POST":
            return request.user and request.user.is_authenticated

        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return is_admin(request.user) or obj.author_id == request.user.id
