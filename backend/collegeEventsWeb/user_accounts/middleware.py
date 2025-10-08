from django.http import JsonResponse
from django.urls import resolve
from rest_framework_simplejwt.authentication import JWTAuthentication

ROLE_PATH_RULES = {
    "student": [
        "/api/events",   # prefix
        "/api/tickets",
    ],
    "organizer": [
        "/api/organizer",  # everything under /api/organizer/...
    ],
    "admin": [
        "/api/adminpanel",  # everything under /api/adminpanel/...
    ],
}

OPEN_PATHS = [
    "/api/user_accounts/login",
    "/user_accounts/register",
    "/user_accounts/logout",
    "/admin",
]

class RoleAuthorizationMiddleware:
    """
    Enforces:
      - Student → /events, /tickets
      - Organizer → /organizer/*
      - Admin → /adminpanel/*
    If a path isn't listed above, it won't be blocked here (your view can still require auth).
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()

    def __call__(self, request):
        path = request.path

        # Skip open paths
        if any(path.startswith(p) for p in OPEN_PATHS):
            return self.get_response(request)

        # Try to authenticate via cookie or header
        request.user = getattr(request, "user", None)
        try:
            header_user_auth = self.jwt_auth.authenticate(request)
            if header_user_auth:
                request.user, _ = header_user_auth
        except Exception:
            # Bad or missing token; we'll only block if path is protected by rules
            pass

        # Determine which role is allowed for this path
        required_role = None
        for role, prefixes in ROLE_PATH_RULES.items():
            if any(path.startswith(prefix) for prefix in prefixes):
                required_role = role
                break

        if required_role:
            if not (getattr(request, "user", None) and request.user.is_authenticated):
                return JsonResponse({"detail": "Authentication required."}, status=401)
            if request.user.role != required_role and request.user.role != "admin":
                # Admin can access anything by policy
                return JsonResponse({"detail": "Forbidden for your role."}, status=403)

        return self.get_response(request)
