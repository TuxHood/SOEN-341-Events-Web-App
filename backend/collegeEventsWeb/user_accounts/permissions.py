# from rest_framework.permissions import BasePermission, SAFE_METHODS

# class IsStudent(BasePermission):
#     def has_permission(self, request, view):
#         return bool(request.user and request.user.is_authenticated and request.user.role == "student")

# class IsOrganizer(BasePermission):
#     def has_permission(self, request, view):
#         return bool(request.user and request.user.is_authenticated and request.user.role == "organizer")

# class IsAdmin(BasePermission):
#     def has_permission(self, request, view):
#         return bool(request.user and request.user.is_authenticated and request.user.role == "admin")

# from rest_framework.permissions import BasePermission

# def get_user_role(user):
#     return getattr(user, "role", None)

# class HasRole(BasePermission):
#     """
#     Replaces IsStudent / IsOrganizer / IsAdmin.
#     Example usages:
#       @permission_classes([HasRole.require("STUDENT")])
#       @permission_classes([HasRole.require("ORGANIZER","ADMIN")])
#     """
#     required_roles = ()

#     @classmethod
#     def require(cls, *roles):
#         class _RolePermission(cls):
#             required_roles = roles
#         return _RolePermission

#     def has_permission(self, request, view):
#         u = request.user
#         return bool(u and u.is_authenticated and get_user_role(u) in self.required_roles)


from rest_framework.permissions import BasePermission

def get_user_role(user):
    return getattr(user, "role", None)

class HasRole(BasePermission):
    """
    Replaces IsStudent / IsOrganizer / IsAdmin.
    Example usages:
      @permission_classes([HasRole.require("student")])
      @permission_classes([HasRole.require("organizer","admin")])
    """
    required_roles = ()

    @classmethod
    def require(cls, *roles):
        class _RolePermission(cls):
            required_roles = roles
        return _RolePermission

    def has_permission(self, request, view):
        u = request.user
        user_role = get_user_role(u)
        # FIXED: Case-insensitive comparison
        return bool(u and u.is_authenticated and 
                   user_role.lower() in [r.lower() for r in self.required_roles])