from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet
from .views import EventViewSet, CategoryViewSet, VenueViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'venues', VenueViewSet, basename='venue')

urlpatterns = [
    path('', include(router.urls)),
]


