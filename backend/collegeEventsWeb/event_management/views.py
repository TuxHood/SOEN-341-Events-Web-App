from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Event, Category, Venue
from .serializers import EventSerializer, CategorySerializer, VenueSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    @action(detail=True, methods=['get'], url_path='analytics')
    def analytics(self, request, pk=None):
        """
        Get analytics data for a specific event:
        - Total tickets issued
        - Tickets checked in (attendance)
        - Venue capacity
        - Remaining capacity
        - Check-in percentage
        """
        event = self.get_object()
        
        # Get ticket statistics
        total_tickets = event.tickets.count()
        checked_in = event.tickets.filter(is_used=True).count()
        venue_capacity = event.venue.capacity
        remaining_capacity = venue_capacity - total_tickets
        
        # Calculate percentages
        check_in_percentage = (checked_in / total_tickets * 100) if total_tickets > 0 else 0
        capacity_utilization = (total_tickets / venue_capacity * 100) if venue_capacity > 0 else 0
        
        analytics_data = {
            'event_id': event.id,
            'event_title': event.title,
            'tickets_issued': total_tickets,
            'tickets_checked_in': checked_in,
            'tickets_pending': total_tickets - checked_in,
            'venue_capacity': venue_capacity,
            'remaining_capacity': remaining_capacity,
            'check_in_percentage': round(check_in_percentage, 2),
            'capacity_utilization': round(capacity_utilization, 2),
        }
        
        return Response(analytics_data)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

