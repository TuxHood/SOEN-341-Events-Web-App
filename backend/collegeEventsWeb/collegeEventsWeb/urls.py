"""
URL configuration for collegeEventsWeb project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
# from django.urls import path, include
# from django.views.generic import RedirectView

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     # root -> events list (friendly default)
#     path('', RedirectView.as_view(url='/api/events/', permanent=False)),
#     path('api/events/', include('collegeEventsWeb.event_management.urls')),
#     path('api/users/', include('collegeEventsWeb.user_accounts.urls')),
#     path('api/tickets/', include('collegeEventsWeb.ticket_services.urls')),
# ]

# from django.contrib import admin
# from django.urls import path, include
# from django.views.generic import RedirectView

# urlpatterns = [
#     path('admin/', admin.site.urls),

#     # Friendly default: root -> events list
#     path('', RedirectView.as_view(url='/api/events/', permanent=False)),

#     # Mount app urls at root because each app already includes its own /api/... prefixes
#     path('', include('collegeEventsWeb.event_management.urls')),  # gives /api/events, /api/categories, /api/venues
#     path('', include('collegeEventsWeb.user_accounts.urls')),     # ensure this file returns /api/users/... or /api/me
#     path('', include('collegeEventsWeb.ticket_services.urls')),   # whatever /api/... ticket routes you expose
#]


# collegeEventsWeb/urls.py
# from django.contrib import admin
# from django.urls import path, include
# from django.views.generic import RedirectView

# urlpatterns = [
#     path('admin/', admin.site.urls),

#     # Friendly default
#     path('', RedirectView.as_view(url='/api/events/', permanent=False)),

#     # Events app already registers /api/events, /api/categories, /api/venues
#     path('', include('collegeEventsWeb.event_management.urls')),

#     # Users app has bare paths (register, login, logout, me) -> mount at /api/users/
#     path('api/users/', include('collegeEventsWeb.user_accounts.urls')),

#     # Tickets app -> mount at /api/tickets/
#     path('api/tickets/', include('collegeEventsWeb.ticket_services.urls')),
# ]



# from django.contrib import admin
# from django.urls import path, include
# from django.views.generic import RedirectView

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('', RedirectView.as_view(url='/api/events/', permanent=False)),

#     # Events already registers /api/events, /api/categories, /api/venues
#     path('', include('collegeEventsWeb.event_management.urls')),

#     # Users are bare paths -> mount under /api/users/
#     path('api/users/', include('collegeEventsWeb.user_accounts.urls')),

#     # Tickets now register /api/tickets → include at root
#     path('', include('collegeEventsWeb.ticket_services.urls')),
# ]



# backend/collegeEventsWeb/collegeEventsWeb/urls.py
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    # Friendly default: root redirects to events list
    path("", RedirectView.as_view(url="/api/events/", permanent=False)),

    # Events → /api/events/, /api/categories/, /api/venues/
    path("api/", include("collegeEventsWeb.event_management.urls")),

    # Users → /api/users/register, /api/users/login, /api/users/me, ...
    path("api/users/", include("collegeEventsWeb.user_accounts.urls")),

    # Tickets → /api/tickets/...
    path("api/tickets/", include("collegeEventsWeb.ticket_services.urls")),
]

