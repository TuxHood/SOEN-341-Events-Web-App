# backend/event_management/views.py
import csv
import qrcode
import os
from io import BytesIO

from django.core.exceptions import FieldDoesNotExist
from django.core.files.base import ContentFile
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
import datetime

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied

from .models import Event, Category, Venue, Ticket
from django.db import IntegrityError
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


def _event_owner_id(event):
    """Return the organizer user id for an event if present, else None."""
    # event may have a relation named 'organizer' pointing to a User, or not.
    if hasattr(event, 'organizer'):
        org = getattr(event, 'organizer')
        if org is None:
            return None
        return getattr(org, 'id', None)
    # Some forks might store a raw organizer_id attribute (unlikely on Django model),
    # so defensively attempt to read it.
    return getattr(event, 'organizer_id', None)

def _first_existing_field(model, *candidates):
    for c in candidates:
        if _has_field(model, c):
            return c
    return None

# ----------------- Events / Categories / Venues -----------------
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    # Use JWT for API auth to avoid CSRF enforcement by SessionAuthentication on unsafe methods.
    authentication_classes = [JWTAuthentication]

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
        # If a date is provided, return events that intersect that date (inclusive).
        # Also support a simple range: ?from=YYYY-MM-DD (start on/after) and ?to=YYYY-MM-DD (start on/before).
        date_str = self.request.query_params.get("date") or None
        from_str = self.request.query_params.get("from") or None
        to_str = self.request.query_params.get("to") or None

        if date_str:
            try:
                date_obj = datetime.date.fromisoformat(date_str)
                if start_field and end_field:
                    # events that start on or before the date and end on or after the date
                    qs = qs.filter(**{f"{start_field}__date__lte": date_obj, f"{end_field}__date__gte": date_obj})
                elif start_field:
                    qs = qs.filter(**{f"{start_field}__date": date_obj})
                else:
                    qs = qs.filter(**{"start_time__date": date_obj})
            except Exception:
                # ignore parse errors and continue with default queryset
                pass

        if from_str:
            try:
                from_obj = datetime.date.fromisoformat(from_str)
                if start_field:
                    qs = qs.filter(**{f"{start_field}__date__gte": from_obj})
                else:
                    qs = qs.filter(**{"start_time__date__gte": from_obj})
            except Exception:
                pass

        if to_str:
            try:
                to_obj = datetime.date.fromisoformat(to_str)
                if start_field:
                    qs = qs.filter(**{f"{start_field}__date__lte": to_obj})
                else:
                    qs = qs.filter(**{"start_time__date__lte": to_obj})
            except Exception:
                pass

        # If no date/range was requested, keep the existing behavior of showing ongoing/upcoming (end >= now)
        if not (date_str or from_str or to_str):
            if end_field:
                qs = qs.filter(**{f"{end_field}__gte": now()})

        # Support organizer filtering for organizer dashboard or admin
        # e.g. ?organizer=me will return only events owned by the requesting user
        org_param = self.request.query_params.get('organizer')
        if org_param:
            # only apply organizer filtering if the Event model actually has an 'organizer' FK
            if _has_field(Event, 'organizer'):
                if org_param == 'me' and self.request.user.is_authenticated:
                    qs = qs.filter(organizer__id=self.request.user.id)
                else:
                    # try to treat organizer as id
                    try:
                        qs = qs.filter(organizer__id=int(org_param))
                    except Exception:
                        # ignore bad values and keep unfiltered qs
                        pass
            else:
                # Event model has no organizer field in this fork - return empty set for organizer-specific queries
                # (frontend expects an empty list rather than an error)
                if org_param == 'me':
                    qs = qs.none()

        # Support filtering by approval state for admin approvals page
        is_approved_param = self.request.query_params.get('is_approved')
        if is_approved_param is not None:
            if is_approved_param.lower() in ('false', '0'):
                qs = qs.filter(is_approved=False)
            elif is_approved_param.lower() in ('true', '1'):
                qs = qs.filter(is_approved=True)

        # If approval filtering not requested, hide unapproved events from public users
        if is_approved_param is None:
            # If the request is for the organizer's own events, include pending ones
            if not (org_param == 'me' and self.request.user.is_authenticated):
                # Admins/staff can see all events
                if not (getattr(self.request.user, 'is_staff', False) or getattr(self.request.user, 'role', '') == 'admin'):
                    qs = qs.filter(is_approved=True)

        # order by start if it exists, else by pk
        order_field = start_field or "id"
        return qs.order_by(order_field)

    def perform_create(self, serializer):
        """Auto-assign the requesting user as the organizer when creating an event."""
        user = self.request.user
        if user and user.is_authenticated:
            # Only pass organizer to serializer if Event model actually has the field
            if _has_field(Event, 'organizer'):
                # Events created by organizers require admin approval by default
                if getattr(user, 'role', '') == 'organizer' and not getattr(user, 'is_staff', False) and getattr(user, 'role', '') != 'admin':
                    # set is_approved False when organizer creates
                    if _has_field(Event, 'is_approved'):
                        serializer.save(organizer=user, is_approved=False)
                    else:
                        serializer.save(organizer=user)
                else:
                    serializer.save(organizer=user)
            else:
                # Event has no organizer field in this fork — just save without organizer
                serializer.save()
        else:
            serializer.save()

    def retrieve(self, request, *args, **kwargs):
        """Allow the event owner or admin to retrieve a single unapproved event even when
        the default queryset hides unapproved events from public listing.
        This keeps discovery lists clean but lets owners and admins access details.
        """
        pk = kwargs.get('pk')
        try:
            # First try the normal path (object present in queryset)
            return super().retrieve(request, *args, **kwargs)
        except Exception:
            # If not found in the queryset, try to fetch directly and validate ownership/admin
            try:
                obj = Event.objects.get(pk=pk)
            except Event.DoesNotExist:
                return Response({'detail': 'No Event matches the given query.'}, status=status.HTTP_404_NOT_FOUND)

            # Check permissions: owner, admin, or staff may view
            user = request.user
            owner_id = _event_owner_id(obj)
            if user and getattr(user, 'is_authenticated', False) and (owner_id == user.id or getattr(user, 'role', '') == 'admin' or getattr(user, 'is_staff', False)):
                serializer = self.get_serializer(obj)
                return Response(serializer.data)
            return Response({'detail': 'No Event matches the given query.'}, status=status.HTTP_404_NOT_FOUND)

    def _ensure_owner_or_admin(self, event):
        """Raise PermissionDenied unless the request user is the event organizer or an admin."""
        user = self.request.user
        if not user or not user.is_authenticated:
            raise PermissionDenied(detail='Authentication required.')
        owner_id = _event_owner_id(event)
        if owner_id != user.id and getattr(user, 'role', '') != 'admin' and not getattr(user, 'is_staff', False):
            raise PermissionDenied(detail='You do not have permission to perform this action on this event.')

    @action(detail=True, methods=['get'], url_path='analytics')
    def analytics(self, request, pk=None):
        """
        Event analytics (kept from main)
        """
        event = self.get_object()
        # Only organizer or admin may view analytics
        try:
            self._ensure_owner_or_admin(event)
        except PermissionDenied:
            return Response({'detail': 'You do not have permission to view analytics for this event.'}, status=status.HTTP_403_FORBIDDEN)
        # ticket related_name in this project is `event_management_tickets`
        total_tickets = event.event_management_tickets.count()
        checked_in = event.event_management_tickets.filter(is_used=True).count()

        # Determine if the event has ended to compute no-shows as a derived metric.
        ended = False
        try:
            # Support either end_time or end_at
            end_ts = getattr(event, 'end_time', None)
            if end_ts is None:
                end_ts = getattr(event, 'end_at', None)
            if end_ts is not None:
                from django.utils.timezone import now as _now
                ended = end_ts <= _now()
        except Exception:
            ended = False

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
            'no_shows': (total_tickets - checked_in) if ended else 0,
            'has_ended': ended,
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

        if request.user.is_authenticated:
            owner_id = _event_owner_id(event)
            if owner_id is not None and owner_id != request.user.id:
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

    # Protect update/delete so non-owners cannot edit events
    def update(self, request, *args, **kwargs):
        event = self.get_object()
        try:
            self._ensure_owner_or_admin(event)
        except PermissionDenied:
            return Response({'detail': 'You do not have permission to edit this event.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        event = self.get_object()
        try:
            self._ensure_owner_or_admin(event)
        except PermissionDenied:
            return Response({'detail': 'You do not have permission to edit this event.'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        event = self.get_object()
        try:
            self._ensure_owner_or_admin(event)
        except PermissionDenied:
            return Response({'detail': 'You do not have permission to delete this event.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'], url_path='attendees/export')
    def export_attendees(self, request, pk=None):
        """
        Organizer-only CSV export
        """
        event = self.get_object()

        if request.user.is_authenticated:
            owner_id = _event_owner_id(event)
            if owner_id is not None and owner_id != request.user.id:
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
    # Do not allow registration for events pending approval
    if hasattr(event, 'is_approved') and not getattr(event, 'is_approved'):
        return Response({"detail": "Event is not open for registration."}, status=403)
    user = request.user

    # Idempotent behavior: if a ticket already exists (possibly from an earlier attempt
    # that failed while saving QR), return the existing ticket instead of 400.
    existing = Ticket.objects.filter(event=event, owner=user).first()
    if existing:
        return Response({
            "ticket_id": str(existing.id),
            "event": event.id,
            "detail": "Ticket already exists.",
            "qr_code": getattr(existing, "qr_code", None) or str(existing.id),
            "qr_png_url": (existing.qr.url if hasattr(existing, "qr") and existing.qr else None),
        }, status=200)

    try:
        ticket = Ticket.objects.create(event=event, owner=user)
    except IntegrityError as e:
        # In case of a race condition, return the existing ticket if present
        existing = Ticket.objects.filter(event=event, owner=user).first()
        if existing:
            return Response({
                "ticket_id": str(existing.id),
                "event": event.id,
                "detail": "Ticket already exists.",
                "qr_code": getattr(existing, "qr_code", None) or str(existing.id),
                "qr_png_url": (existing.qr.url if hasattr(existing, "qr") and existing.qr else None),
            }, status=200)
        # Surface diagnostic info in development
        from django.conf import settings as _settings
        msg = "Could not create ticket."
        if getattr(_settings, 'DEBUG', False):
            msg = f"IntegrityError: {e}"
        return Response({"detail": msg}, status=400)
    except Exception as e:
        from django.conf import settings as _settings
        msg = "Could not create ticket."
        if getattr(_settings, 'DEBUG', False):
            msg = f"{e.__class__.__name__}: {e}"
        return Response({"detail": msg}, status=400)

    # Optional: save PNG to a File/ImageField named 'qr'.
    # Be defensive about missing MEDIA_ROOT directory to avoid 500s.
    if hasattr(ticket, "qr"):
        try:
            # Ensure MEDIA_ROOT exists so FileSystemStorage can write files
            os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

            qr_img = qrcode.make(str(ticket.id))
            buf = BytesIO()
            qr_img.save(buf, format="PNG")
            ticket.qr.save(f"ticket-{ticket.id}.png", ContentFile(buf.getvalue()), save=True)
        except Exception:
            # If QR image saving fails (e.g., no filesystem), continue without blocking purchase
            pass

    return Response({
        "ticket_id": str(ticket.id),
        "event": event.id,
        "detail": "Ticket purchased.",
        # Provide a textual QR payload as a fallback (works for client-side QR rendering)
        "qr_code": getattr(ticket, "qr_code", None) or str(ticket.id),
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


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def checkin_ticket(request, ticket_id: str):
    """Endpoint to check-in a ticket by its id (used by QR scanner tools).

    URL shape in some deployments used `/api/tickets/<ticket_id>/checkin/`.
    This implementation is defensive: look up the ticket, verify permissions,
    mark it used and return a small JSON payload.
    """
    try:
        t = Ticket.objects.select_related('event', 'owner').get(pk=ticket_id)
    except Ticket.DoesNotExist:
        return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

    # Only event organizer or admin may perform check-ins (or the ticket owner can self-checkin)
    user = request.user
    if not (getattr(user, 'is_authenticated', False)):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    event = getattr(t, 'event', None)
    owner_id = _event_owner_id(event)
    allowed = (event and (
        (owner_id is not None and owner_id == user.id)
        or getattr(user, 'role', '') == 'admin'
        or t.owner_id == user.id
        or getattr(user, 'is_staff', False)
    ))
    if not allowed:
        # In development, return helpful debug info to diagnose permission mismatches
        try:
            from django.conf import settings as _settings
            if getattr(_settings, 'DEBUG', False):
                return Response({
                    "detail": "You do not have permission to check in this ticket.",
                    "debug": {
                        "request_user_id": getattr(user, 'id', None),
                        "request_user_role": getattr(user, 'role', None),
                        "event_id": getattr(event, 'id', None),
                        "event_owner_id": owner_id,
                        "ticket_owner_id": getattr(t, 'owner_id', None),
                    }
                }, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            pass
        return Response({"detail": "You do not have permission to check in this ticket."}, status=status.HTTP_403_FORBIDDEN)

    if t.is_used:
        return Response({"detail": "Ticket already checked in."}, status=status.HTTP_400_BAD_REQUEST)

    t.is_used = True
    t.save()
    return Response({
        "ticket_id": str(t.id),
        "checked_in": True,
        "event": event.id if event else None,
        "event_title": getattr(event, 'title', None),
        "attendee_name": getattr(getattr(t, 'owner', None), 'name', None),
        "attendee_email": getattr(getattr(t, 'owner', None), 'email', None),
    }, status=200)
