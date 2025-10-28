# from django.urls import path
# from .views import RegisterView, LoginView, LogoutView, MeView

# urlpatterns = [
#     path("register", RegisterView.as_view(), name="register"),
#     path("login",    LoginView.as_view(),    name="login"),
#     path("logout",   LogoutView.as_view(),   name="logout"),
#     path("me",       MeView.as_view(),       name="me"),
# ]


# backend/collegeEventsWeb/user_accounts/urls.py
# backend/collegeEventsWeb/user_accounts/urls.py
from django.urls import path
from .views import RegisterView, LoginView, LogoutView, MeView

app_name = "user_accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/",    LoginView.as_view(),    name="login"),
    path("logout/",   LogoutView.as_view(),   name="logout"),
    path("me/",       MeView.as_view(),       name="me"),
]

