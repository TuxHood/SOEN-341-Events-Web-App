# backend/event_management/views.py
import csv
import qrcode
from io import BytesIO

from django.core.exceptions import FieldDoesNotExist
from django.core.files.base import ContentFile
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
import datetime

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Event, Category, Venue, Ticket
from .serializers import (
    EventSerializer, CategorySerializer, VenueSerializer, TicketSerializer
)

# ---------- helpers to tolerate either start_at/start_time and end_at/end_time ----------
def _has_field(model, name: str) -> bool:
    try:
        model._meta.get_field(name)
        return True
    except FieldDoesNotExist:
        return False

def _first_existing_field(model, *candidates):
    for c in candidates:
        if _has_field(model, c):
            return c
    return None

# ----------------- Events / Categories / Venues -----------------
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    # ensure EventSerializer gets request in context (for absolute image_url)
    def get_serializer(self, *args, **kwargs):
        kwargs.setdefault("context", {})
        kwargs["context"]["request"] = self.request
        return super().get_serializer(*args, **kwargs)

    def get_queryset(self):
        start_field = _first_existing_field(Event, "start_at", "start_time")
        end_field   = _first_existing_field(Event, "end_at", "end_time")

        qs = Event.objects.all()

        # Optional: filter by a specific date passed as ?date=YYYY-MM-DD
        date_str = self.request.query_params.get("date") or None
        if date_str:
            try:
                date_obj = datetime.date.fromisoformat(date_str)
                if start_field:
                    qs = qs.filter(**{f"{start_field}__date": date_obj})
                else:
                    qs = qs.filter(start_time__date=date_obj)
            except Exception:
                # ignore parse errors and continue with default queryset
                pass

        # show ongoing/upcoming (end >= now) if end exists
        if end_field:
            qs = qs.filter(**{f"{end_field}__gte": now()})

        # order by start if it exists, else by pk
        order_field = start_field or "id"
        return qs.order_by(order_field)

    @action(detail=True, methods=['get'], url_path='analytics')
    def analytics(self, request, pk=None):
        """
        Event analytics (kept from main)
        """
        event = self.get_object()
        # ticket related_name in this project is `event_management_tickets`
        total_tickets = event.event_management_tickets.count()
        checked_in = event.event_management_tickets.filter(is_used=True).count()

        # Event model may not have a Venue relation in this fork; be defensive.
        venue_obj = getattr(event, 'venue', None)
        if venue_obj is not None and hasattr(venue_obj, 'capacity'):
            venue_capacity = venue_obj.capacity
        else:
            # fallback: use total_tickets as capacity to avoid division errors
            venue_capacity = total_tickets or 0

        remaining_capacity = max(venue_capacity - total_tickets, 0)

        check_in_percentage = (checked_in / total_tickets * 100) if total_tickets > 0 else 0
        capacity_utilization = (total_tickets / venue_capacity * 100) if venue_capacity > 0 else 0

        return Response({
            'event_id': event.id,
            'event_title': event.title,
            'tickets_issued': total_tickets,
            'tickets_checked_in': checked_in,
            'tickets_pending': total_tickets - checked_in,
            'venue_capacity': venue_capacity,
            'remaining_capacity': remaining_capacity,
            'check_in_percentage': round(check_in_percentage, 2),
            'capacity_utilization': round(capacity_utilization, 2),
        })

    @action(detail=True, methods=['get'], url_path='attendees')
    def attendees(self, request, pk=None):
        """
        Organizer-only attendee list (from main)
        """
        event = self.get_object()

        if request.user.is_authenticated and getattr(event, "organizer_id", None) != request.user.id:
            if getattr(request.user, "role", "") != 'admin':
                return Response(
                    {'detail': 'You do not have permission to view attendees for this event.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        tickets = event.event_management_tickets.select_related('owner').all()
        attendee_list = [{
            'ticket_id': str(t.id),
            'name': getattr(t.owner, "name", ""),
            'email': getattr(t.owner, "email", ""),
            'is_checked_in': t.is_used,
            'check_in_time': t.created_at if t.is_used else None,
            'qr_code': getattr(t, "qr_code", None),
        } for t in tickets]

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
        Organizer-only CSV export
        """
        event = self.get_object()

        if request.user.is_authenticated and getattr(event, "organizer_id", None) != request.user.id:
            if getattr(request.user, "role", "") != 'admin':
                return Response(
                    {'detail': 'You do not have permission to export attendees for this event.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="attendees_{event.id}_{event.title.replace(" ", "_")}.csv"'
        writer = csv.writer(response)
        writer.writerow(['Ticket ID', 'Name', 'Email', 'Check-in Status', 'Check-in Time', 'QR Code'])

        for t in event.event_management_tickets.select_related('owner').all():
            writer.writerow([
                str(t.id),
                getattr(t.owner, "name", ""),
                getattr(t.owner, "email", ""),
                'Checked In' if t.is_used else 'Not Checked In',
                t.created_at if t.is_used else '',
                getattr(t, "qr_code", ""),
            ])
        return response

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

# ----------------- Tickets for current user -----------------
class TicketViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Optional: /api/tickets/ for current user.
    """
    serializer_class = TicketSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (Ticket.objects
                .select_related("event")
                .filter(owner=self.request.user)   # adjust to .filter(user=...) if your model uses 'user'
                .order_by("-created_at"))

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

# ----------------- Auth / Profile -----------------
@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({
        "id": u.id,
        "email": getattr(u, "email", None),
        "first_name": getattr(u, "first_name", "") or "",
        "last_name": getattr(u, "last_name", "") or "",
        "role": getattr(u, "role", "student"),
    })

# ----------------- Buy / My tickets / Ticket for event -----------------
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def buy_ticket(request, event_id: int):
    """
    POST /api/events/<event_id>/buy/ — one ticket per user per event.
    """
    event = get_object_or_404(Event, pk=event_id)
    user = request.user

    if Ticket.objects.filter(event=event, owner=user).exists():  # adjust if model uses 'user'
        return Response({"detail": "You already have a ticket for this event."}, status=400)

    ticket = Ticket.objects.create(event=event, owner=user)

    # Optional: save PNG to a File/ImageField named 'qr'
    if hasattr(ticket, "qr"):
        qr_img = qrcode.make(str(ticket.id))
        buf = BytesIO()
        qr_img.save(buf, format="PNG")
        ticket.qr.save(f"ticket-{ticket.id}.png", ContentFile(buf.getvalue()), save=True)

    return Response({
        "ticket_id": str(ticket.id),
        "event": event.id,
        "detail": "Ticket purchased.",
        "qr_code": getattr(ticket, "qr_code", None),
        "qr_png_url": (ticket.qr.url if hasattr(ticket, "qr") and ticket.qr else None),
    }, status=201)

class MyTicketsList(generics.ListAPIView):
    """
    /api/me/tickets/ — current user's tickets
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        return (Ticket.objects
                .filter(owner=self.request.user)   # adjust if model uses 'user'
                .select_related("event")
                .order_by("-event__start_time", "-id"))

    def get_serializer_context(self):
        return {"request": self.request}

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_ticket_for_event(request, event_id: int):
    """
    GET /api/events/<event_id>/ticket/
    """
    event = get_object_or_404(Event, pk=event_id)
    ticket = (Ticket.objects
              .filter(event=event, owner=request.user)   # adjust if model uses 'user'
              .select_related("event")
              .first())
    if not ticket:
        return Response({"detail": "No ticket for this event."}, status=404)

    return Response({
        "ticket_id": str(ticket.id),
        "event": event.id,
        "event_title": getattr(event, "title", None) or getattr(event, "name", None),
        "qr_code": getattr(ticket, "qr_code", None),
        "qr_png_url": (ticket.qr.url if hasattr(ticket, "qr") and ticket.qr else None),
    })

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def cancel_ticket(request, event_id: int):
    """
    POST /api/events/<event_id>/cancel/
    """
    get_object_or_404(Event, pk=event_id)  # ensure event exists
    ticket = Ticket.objects.filter(event_id=event_id, owner=request.user).first()  # adjust if model uses 'user'
    if not ticket:
        return Response({"detail": "No ticket for this event."}, status=404)
    ticket.delete()
    return Response({"detail": "Registration cancelled."}, status=200)
