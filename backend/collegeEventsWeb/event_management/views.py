from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    # Permissions logic — only admins can approve/reject
    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    # --- Admin approves event ---
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Admin approves and publishes an event."""
        event = self.get_object()
        event.status = 'approved'
        event.is_published = True
        event.reviewed_by = request.user
        event.reviewed_at = timezone.now()
        event.save()

        return Response(
            {"message": f"✅ Event '{event.title}' approved and published."},
            status=status.HTTP_200_OK
        )

    # --- Admin rejects event ---
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Admin rejects an event submission."""
        event = self.get_object()
        event.status = 'rejected'
        event.is_published = False
        event.reviewed_by = request.user
        event.reviewed_at = timezone.now()
        event.save()

        return Response(
            {"message": f"❌ Event '{event.title}' rejected."},
            status=status.HTTP_200_OK
        )
