from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from user_accounts.permissions import HasRole
from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [HasRole.require('student')]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [HasRole.require('admin')]
        else:
            permission_classes = [IsAuthenticated]
        return [p() for p in permission_classes]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", "").lower()
        
        if role == "admin":
            return Ticket.objects.all()
        if role == "organizer":
            from event_management.models import Event
            organizer_events = Event.objects.filter(organizer=user)
            return Ticket.objects.filter(event__in=organizer_events)
        return Ticket.objects.filter(buyer=user)

    def perform_create(self, serializer):
        if getattr(self.request.user, "role", "").lower() != 'student':
            raise PermissionDenied("Only students can purchase tickets")
        serializer.save(buyer=self.request.user)