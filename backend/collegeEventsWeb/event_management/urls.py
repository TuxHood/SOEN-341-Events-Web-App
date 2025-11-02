from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    EventViewSet,
    CategoryViewSet,
    VenueViewSet,
    TicketViewSet,
    me,
    buy_ticket,
    get_ticket_for_event,
    cancel_ticket,
    MyTicketsList,
)
from .analytics_views import global_analytics  # from main

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    # Global analytics
    path('analytics/global/', global_analytics),

    # DRF viewsets
    path('', include(router.urls)),

    # Auth / Profile
    path('users/me/', me, name='users_me'),

    # Ticket purchase + view/cancel for event
    path('events/<int:event_id>/buy/', buy_ticket, name='buy_ticket'),
    path('events/<int:event_id>/ticket/', get_ticket_for_event, name='get_ticket_for_event'),
    path('events/<int:event_id>/cancel/', cancel_ticket, name='cancel_ticket'),

    # My tickets (class-based)
    path('me/tickets/', MyTicketsList.as_view(), name='my_tickets'),
]
