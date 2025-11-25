from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    UserViewSet,
    DebugAuthView,
    GetCSRFTokenView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

# Router for admin user endpoints (/api/users/)
router = DefaultRouter()
router.register(r"", UserViewSet, basename="user")

urlpatterns = [
    # -----------------------
    # AUTHENTICATION (existing)
    # -----------------------
    path("register/", RegisterView.as_view(), name="register"),
    path("login/",    LoginView.as_view(),    name="login"),
    path("logout/",   LogoutView.as_view(),   name="logout"),
    path("me/",       MeView.as_view(),       name="me"),
    path("debug-auth/", DebugAuthView.as_view(), name="debug-auth"),
    path("csrf/", GetCSRFTokenView.as_view(), name="get-csrf"),

    # -----------------------
    # PASSWORD RESET (NEW)
    # -----------------------
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password-reset"
    ),
    path(
        "password-reset/<str:uidb64>/<str:token>/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm"
    ),

    # -----------------------
    # Router (UserViewSet)
    # /api/users/ -> user list, user detail, admin actions
    # -----------------------
    path("", include(router.urls)),
]
