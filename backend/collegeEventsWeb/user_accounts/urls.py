from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, LogoutView, MeView, UserViewSet, DebugAuthView
from .views import GetCSRFTokenView

router = DefaultRouter()
router.register(r"", UserViewSet, basename="user")

urlpatterns = [
    # Paths are relative to the include in project urls: path('api/users/', include(...))
    path("register/", RegisterView.as_view(), name="register"),
    path("login/",    LoginView.as_view(),    name="login"),
    path("logout/",   LogoutView.as_view(),   name="logout"),
    path("me/",       MeView.as_view(),       name="me"),
    path("debug-auth/", DebugAuthView.as_view(), name="debug-auth"),
    path("csrf/", GetCSRFTokenView.as_view(), name="get-csrf"),
    path("", include(router.urls)),
]
