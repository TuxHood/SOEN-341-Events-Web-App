from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, LogoutView, MeView, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path("users/register", RegisterView.as_view(), name="register"),
    path("users/login",    LoginView.as_view(),    name="login"),
    path("users/logout",   LogoutView.as_view(),   name="logout"),
    path("users/me",       MeView.as_view(),       name="me"),
    path("", include(router.urls)),
]
