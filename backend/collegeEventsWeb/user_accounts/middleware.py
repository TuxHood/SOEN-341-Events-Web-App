from django.http import JsonResponse
from django.urls import resolve
from rest_framework_simplejwt.authentication import JWTAuthentication

ROLE_PATH_RULES = {
    "student": [
        # Students may access ticket-related endpoints; event list/detail permissions
        # are handled at the view level (organizer-only checks are implemented in views).
        "/api/tickets",
    ],
    "organizer": [
        "/api/organizer",  # everything under /api/organizer/...
        "/api/tickets",    # organizers should be able to access ticket endpoints (check-in, listing)
    ],
    "admin": [
        "/api/adminpanel",  # everything under /api/adminpanel/...
    ],
}

OPEN_PATHS = [
    # Public auth endpoints as mounted under /api/ (see user_accounts.urls)
    "/api/users/login",
    "/api/users/register",
    "/api/users/logout",
    # Admin UI and static admin assets should remain open to allow login page
    "/admin",
    # CSRF helper used by the SPA to set the csrftoken cookie
    "/api/csrf",
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
        # If an 'access_token' cookie is present, copy it to the Authorization header
        # so DRF's JWTAuthentication (which reads HTTP_AUTHORIZATION) can authenticate.
        try:
            if 'HTTP_AUTHORIZATION' not in request.META:
                token = request.COOKIES.get('access_token')
                if token:
                    request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        except Exception:
            # ignore cookie reading errors
            pass

        request.user = getattr(request, "user", None)
        try:
            header_user_auth = self.jwt_auth.authenticate(request)
            if header_user_auth:
                request.user, _ = header_user_auth
        except Exception:
            # Bad or missing token; we'll only block if path is protected by rules
            pass

        # Determine which roles are allowed for this path (collect all matches)
        allowed_roles = set()
        for role, prefixes in ROLE_PATH_RULES.items():
            if any(path.startswith(prefix) for prefix in prefixes):
                allowed_roles.add(role)

        if allowed_roles:
            if not (getattr(request, "user", None) and request.user.is_authenticated):
                return JsonResponse({"detail": "Authentication required."}, status=401)

            # Admin can always access
            if request.user.role == "admin":
                return self.get_response(request)

            # Exact role allowed?
            if request.user.role in allowed_roles:
                return self.get_response(request)

            # Backwards-compatible: allow organizer-flagged users when organizer role is allowed
            if "organizer" in allowed_roles:
                if getattr(request.user, "is_organizer", False) or getattr(request.user, "is_approved_organizer", False):
                    return self.get_response(request)

            return JsonResponse({"detail": "Forbidden for your role."}, status=403)

        return self.get_response(request)
