# """
# URL configuration for core project.

# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/5.2/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Class-based views
#     1. Add an import:  from other_app.views import Home
#     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """
# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     # include the collegeEventsWeb project's URL configuration so API routes
#     # (for example /api/events/) are available when using the top-level
#     # manage.py which points to core.settings
#     path('', include('collegeEventsWeb.collegeEventsWeb.urls')),
# ]


# # core/urls.py
# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     # Django admin
#     path("admin/", admin.site.urls),

#     # API routes (mounted at root so you get /api/events/, /api/me, etc.)
#     path("", include("collegeEventsWeb.event_management.urls")),
#     path("", include("collegeEventsWeb.user_accounts.urls")),
#     # If you have routes in ticket_services, include them too:
#     path("", include("collegeEventsWeb.ticket_services.urls")),
# ]

# core/urls.py
# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     # Django admin
#     path("admin/", admin.site.urls),

#     # API routes (mounted at root so you get /api/events/, /api/me, etc.)
#     path("", include("collegeEventsWeb.event_management.urls")),
#     path("", include("collegeEventsWeb.user_accounts.urls")),
#     # If you have routes in ticket_services, include them too:
#     path("", include("collegeEventsWeb.ticket_services.urls")),
# ]



# backend/core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Friendly default: root -> events list
    path("", RedirectView.as_view(url="/api/events/", permanent=False)),
    # Delegate to the app-level URLConf (this module exists)
    path("", include("collegeEventsWeb.collegeEventsWeb.urls")),
]

