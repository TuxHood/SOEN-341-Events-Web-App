from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, CategoryViewSet, VenueViewSet, GetEventsByUserView
from .analytics_views import global_analytics

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'venues', VenueViewSet)

urlpatterns = [
    path('analytics/global/', global_analytics),
    path('', include(router.urls)),
    path('event/all/', GetEventsByUserView.as_view(), name='events-by-user'),
]
