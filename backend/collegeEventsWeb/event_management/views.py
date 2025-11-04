from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
import csv

from .models import Event, Category, Venue
from .serializers import EventSerializer, CategorySerializer, VenueSerializer
from user_accounts.permissions import HasRole

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.all()

    def _role(self, user):
        role = getattr(user, "role", "").lower()
        if role not in ["student", "organizer", "admin"]:
            return "student"
        return role

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            permission_classes = [HasRole.require("organizer", "admin")]
        elif self.action in ["approve", "reject"]:
            permission_classes = [HasRole.require("admin")]
        else:
            permission_classes = [AllowAny]
        return [p() for p in permission_classes]

    def get_queryset(self):
        user = self.request.user
        role = self._role(user)
        qs = Event.objects.all()

        if self.action in ["list", "retrieve"]:
            if role == "admin":
                return qs
            if role == "organizer":
                return qs.filter(
                    Q(organizer=user) | Q(status=Event.Status.APPROVED)
                ).distinct()
            return qs.filter(status=Event.Status.APPROVED)

        if role == "admin":
            return qs
        if role == "organizer":
            return qs.filter(organizer=user)
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        role = self._role(user)

        if role == "admin":
            organizer = serializer.validated_data.get("organizer", user)
            serializer.save(organizer=organizer)
            return

        if role == "organizer":
            serializer.save(organizer=user, status=Event.Status.PENDING)
            return

        raise PermissionDenied("Students are not allowed to create events.")

    @action(detail=True, methods=["post"], permission_classes=[HasRole.require("admin")])
    def approve(self, request, pk=None):
        event = self.get_object()
        event.status = Event.Status.APPROVED
        event.save(update_fields=["status"])
        return Response({"message": "Event approved", "id": event.id, "status": event.status})

    @action(detail=True, methods=["post"], permission_classes=[HasRole.require("admin")])
    def reject(self, request, pk=None):
        event = self.get_object()
        event.status = Event.Status.REJECTED
        event.save(update_fields=["status"])
        return Response({"message": "Event rejected", "id": event.id, "status": event.status})

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            permission_classes = [HasRole.require("organizer", "admin")]
        else:
            permission_classes = [AllowAny]
        return [p() for p in permission_classes]

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            permission_classes = [HasRole.require("organizer", "admin")]
        else:
            permission_classes = [AllowAny]
        return [p() for p in permission_classes]