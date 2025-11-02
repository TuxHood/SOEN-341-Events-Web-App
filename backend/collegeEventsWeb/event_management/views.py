# backend/event_management/views.py
import qrcode
from io import BytesIO

from django.core.exceptions import FieldDoesNotExist
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.timezone import now

from .models import Event, Category, Venue, Ticket            # ✅ use local Ticket
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

        # show ongoing/upcoming (end >= now) if end exists
        if end_field:
            qs = qs.filter(**{f"{end_field}__gte": now()})

        # order by start if it exists, else by pk
        order_field = start_field or "id"
        return qs.order_by(order_field)


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
        # ✅ use user consistently
        return (Ticket.objects
                .select_related("event")
                .filter(owner=self.request.user)
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
    POST /api/events/<event_id>/buy/
    One ticket per user per event.
    """
    event = get_object_or_404(Event, pk=event_id)
    user = request.user

    if Ticket.objects.filter(event=event, owner=user).exists():     # ✅ user
        return Response({"detail": "You already have a ticket for this event."}, status=400)

    ticket = Ticket.objects.create(event=event, owner=user)

    # If you have a File/ImageField named 'qr', save PNG there (optional)
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
    If you’re using this class-based view instead of the function below,
    make sure your urls.py points /api/me/tickets/ here.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        return (
            Ticket.objects
            .filter(owner=self.request.user)
            .select_related("event")
            .order_by("-event__start_time", "-id")   
        )

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
              .filter(event=event, owner=request.user)           
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


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def my_tickets(request):
   
    qs = Ticket.objects.filter(owner=request.user).select_related("event")     # ✅ user
    ser = TicketSerializer(qs, many=True, context={"request": request})       # ✅ context for absolute image URLs
    return Response(ser.data)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def cancel_ticket(request, event_id):          # use event_id: int; if Event.id is UUID, change to event_id
    get_object_or_404(Event, pk=event_id)      # ensure event exists
    ticket = Ticket.objects.filter(event_id=event_id, owner=request.user).first()
    if not ticket:
        return Response({"detail": "No ticket for this event."}, status=404)
    ticket.delete()
    return Response({"detail": "Registration cancelled."}, status=200)