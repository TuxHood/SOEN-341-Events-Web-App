# from django.urls import path
# from .views import RegisterView, LoginView, LogoutView, MeView

# urlpatterns = [
#     path("register", RegisterView.as_view(), name="register"),
#     path("login",    LoginView.as_view(),    name="login"),
#     path("logout",   LogoutView.as_view(),   name="logout"),
#     path("me",       MeView.as_view(),       name="me"),
# ]


# backend/collegeEventsWeb/user_accounts/urls.py
from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, MeView,
    PendingOrganizersView, ApproveOrganizerView, RejectOrganizerView
)

app_name = "user_accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    
    # Admin-only routes for organizer approval
    path("pending-organizers/", PendingOrganizersView.as_view(), name="pending-organizers"),
    path("<int:user_id>/approve/", ApproveOrganizerView.as_view(), name="approve-organizer"),
    path("<int:user_id>/reject/", RejectOrganizerView.as_view(), name="reject-organizer"),
]