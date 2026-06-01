from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    Read for everyone.
    Write only for admin/staff.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Read according to the view/queryset.
    Write only for object owner or admin/staff.
    Works with objects that have one of these fields:
    author / user / owner
    """

    owner_fields = ("author", "user", "owner")

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_staff:
            return True

        for field in self.owner_fields:
            if hasattr(obj, field):
                return getattr(obj, field) == user

        return False


class IsCommentOwnerOrAdmin(BasePermission):
    """
    For comment-like objects with `user` field.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        return user.is_staff or obj.user == user
