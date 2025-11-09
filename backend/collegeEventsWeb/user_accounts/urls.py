from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView, MeView, 
    PendingOrganizersView, ApproveOrganizerView, RejectOrganizerView,
    DebugAuthView, GetCSRFTokenView, UserViewSet
)

app_name = "user_accounts"

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    
    # Admin-only routes for organizer approval (Your clean structure)
    path("pending-organizers/", PendingOrganizersView.as_view(), name="pending-organizers"),
    path("<int:user_id>/approve/", ApproveOrganizerView.as_view(), name="approve-organizer"),
    path("<int:user_id>/reject/", RejectOrganizerView.as_view(), name="reject-organizer"),
    
    # Utility endpoints
    path("debug-auth/", DebugAuthView.as_view(), name="debug-auth"),
    path("csrf/", GetCSRFTokenView.as_view(), name="get-csrf"),
    
    # Include router URLs for User CRUD operations
    path("", include(router.urls)),
]
