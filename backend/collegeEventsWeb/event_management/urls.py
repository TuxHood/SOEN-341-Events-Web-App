from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet
from .views import EventViewSet, CategoryViewSet, VenueViewSet
from .analytics_views import global_analytics

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('analytics/global/', global_analytics),
    path('', include(router.urls)),
    
]


