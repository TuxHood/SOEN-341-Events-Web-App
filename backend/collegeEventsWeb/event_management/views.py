from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.http import HttpResponse
import csv
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
    
    @action(detail=True, methods=['get'], url_path='attendees')
    def attendees(self, request, pk=None):
        """
        Get list of all attendees for a specific event.
        Returns ticket information including check-in status.
        Only accessible to the event organizer.
        """
        event = self.get_object()
        
        # Security check: Only allow the organizer to view attendees
        if request.user.is_authenticated and event.organizer.id != request.user.id:
            if request.user.role != 'admin':
                return Response(
                    {'detail': 'You do not have permission to view attendees for this event.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Get all tickets for this event
        tickets = event.tickets.select_related('owner').all()
        
        # Build the attendee list
        attendee_list = []
        for ticket in tickets:
            attendee_list.append({
                'ticket_id': str(ticket.id),
                'name': ticket.owner.name,
                'email': ticket.owner.email,
                'is_checked_in': ticket.is_used,
                'check_in_time': ticket.created_at if ticket.is_used else None,
                'qr_code': ticket.qr_code,
            })
        
        return Response({
            'event_id': event.id,
            'event_title': event.title,
            'total_attendees': len(attendee_list),
            'checked_in_count': sum(1 for a in attendee_list if a['is_checked_in']),
            'attendees': attendee_list,
        })

    @action(detail=True, methods=['get'], url_path='attendees/export')
    def export_attendees(self, request, pk=None):
        """
        Export attendee list as CSV file.
        Only accessible to the event organizer.
        """
        event = self.get_object()
        
        # Security check: Only allow the organizer to export attendees
        if request.user.is_authenticated and event.organizer.id != request.user.id:
            if request.user.role != 'admin':
                return Response(
                    {'detail': 'You do not have permission to export attendees for this event.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Create the HttpResponse with CSV content type
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="attendees_{event.id}_{event.title.replace(" ", "_")}.csv"'
        
        # Create CSV writer
        writer = csv.writer(response)
        
        # Write header row
        writer.writerow(['Ticket ID', 'Name', 'Email', 'Check-in Status', 'Check-in Time', 'QR Code'])
        
        # Get all tickets and write data rows
        tickets = event.tickets.select_related('owner').all()
        for ticket in tickets:
            writer.writerow([
                str(ticket.id),
                ticket.owner.name,
                ticket.owner.email,
                'Checked In' if ticket.is_used else 'Not Checked In',
                ticket.created_at if ticket.is_used else '',
                ticket.qr_code,
            ])
        
        return response
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

class GetEventsByUserView(generics.ListAPIView):
    serializer_class = EventSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        # /api/event/all/?category=Music
        category_name = request.query_params.get('category', None)
        # user = request.user
        events = Event.objects.all()
        if category_name is None or category_name.lower() == 'all':
            events = Event.objects.all()
        else:
            events = Event.objects.filter(category__name=category_name)
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)