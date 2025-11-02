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
    cancel_ticket,        # <-- import it
    MyTicketsList,        # use this OR my_tickets (pick one)
    # my_tickets,         # comment out if not using
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    # DRF viewsets
    path('', include(router.urls)),

    # extra endpoints
    path('users/me/', me, name='users_me'),
    path('events/<int:event_id>/buy/', buy_ticket, name='buy_ticket'),
    path('events/<int:event_id>/ticket/', get_ticket_for_event, name='get_ticket_for_event'),
    path('events/<int:event_id>/cancel/', cancel_ticket, name='cancel_ticket'),

    # My tickets – choose ONE of these:
    path('me/tickets/', MyTicketsList.as_view(), name='my_tickets'),
    # path('me/tickets/', my_tickets, name='my_tickets'),
]