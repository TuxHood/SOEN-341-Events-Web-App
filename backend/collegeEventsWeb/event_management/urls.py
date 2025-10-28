# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import EventViewSet, CategoryViewSet, VenueViewSet

# router = DefaultRouter()
# router.register(r'events', EventViewSet)
# router.register(r'categories', CategoryViewSet)
# router.register(r'venues', VenueViewSet)

# urlpatterns = [
#     path('', include(router.urls)),
# ]

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import EventViewSet, CategoryViewSet, VenueViewSet

# app_name = "event_management"  # optional, good for namespacing

# router = DefaultRouter()
# router.register(r"api/events", EventViewSet, basename="event")
# router.register(r"api/categories", CategoryViewSet, basename="category")
# router.register(r"api/venues", VenueViewSet, basename="venue")

# urlpatterns = [
#     path("", include(router.urls)),
# ]



# collegeEventsWeb/event_management/urls.py
# backend/collegeEventsWeb/event_management/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, CategoryViewSet, VenueViewSet

app_name = "event_management"

router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"venues", VenueViewSet, basename="venue")

urlpatterns = [
    path("", include(router.urls)),
]
