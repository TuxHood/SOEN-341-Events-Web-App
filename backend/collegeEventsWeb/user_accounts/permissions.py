from rest_framework.permissions import BasePermission, SAFE_METHODS

class HasRole(BasePermission):
    """
    Base class for role-based permissions.
    Subclass this and set required_roles to use it.
    """
    required_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in self.required_roles


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "student")


class IsOrganizer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "organizer")


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsStudentOrOrganizer(BasePermission):
    """Combined permission for student or organizer access"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ["student", "organizer"]
        )


class IsOrganizerOrAdmin(BasePermission):
    """Combined permission for organizer or admin access"""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ["organizer", "admin"]
        )