from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from user_accounts.permissions import IsStudent, IsAdmin
from .models import Ticket
from .serializers import TicketSerializer


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()  # ← ADD THIS LINE!
    serializer_class = TicketSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            # Only students can buy tickets
            permission_classes = [IsStudent]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only admins can modify tickets
            permission_classes = [IsAdmin]
        else:
            # Anyone authenticated can list/retrieve
            permission_classes = [IsAuthenticated]
        return [p() for p in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", "").lower()
        
        if role == "admin":
            return Ticket.objects.all()
        
        if role == "organizer":
            # Organizers can see tickets for their events
            from event_management.models import Event
            organizer_events = Event.objects.filter(organizer=user)
            return Ticket.objects.filter(event__in=organizer_events)
        
        # Students see only their own tickets
        return Ticket.objects.filter(owner=user)
    
    def perform_create(self, serializer):
        # Double-check only students can create tickets
        if getattr(self.request.user, "role", "").lower() != 'student':
            raise PermissionDenied("Only students can purchase tickets")
        
        serializer.save(owner=self.request.user)
