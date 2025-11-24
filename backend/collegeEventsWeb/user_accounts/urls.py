from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView, MeView, UserViewSet, DebugAuthView,
    GetCSRFTokenView, ApproveOrganizerView, RejectOrganizerView, PendingOrganizersView
)

router = DefaultRouter()
router.register(r"", UserViewSet, basename="user")

urlpatterns = [
    # Auth endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("debug-auth/", DebugAuthView.as_view(), name="debug-auth"),
    path("csrf/", GetCSRFTokenView.as_view(), name="get-csrf"),
    
    # RBAC approval endpoints (your RBAC feature)
    path("pending/", PendingOrganizersView.as_view(), name="pending-organizers"),
    path("<int:pk>/approve/", ApproveOrganizerView.as_view(), name="approve-organizer"),
    path("<int:pk>/reject/", RejectOrganizerView.as_view(), name="reject-organizer"),
    
    # ViewSet routes
    path("", include(router.urls)),
]
