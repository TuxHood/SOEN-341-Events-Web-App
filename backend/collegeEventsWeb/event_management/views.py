# from rest_framework import viewsets, status
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from django.db.models import Q

# from .models import Event, Category, Venue
# from .serializers import EventSerializer, CategorySerializer, VenueSerializer

# # use the generic role permission you just created
# from collegeEventsWeb.user_accounts.permissions import HasRole


# #from rest_framework import viewsets
# #from .models import Event, Category, Venue
# #from .serializers import EventSerializer, CategorySerializer, VenueSerializer

# # class EventViewSet(viewsets.ModelViewSet):
# #     queryset = Event.objects.all()
# #     serializer_class = EventSerializer

# # class CategoryViewSet(viewsets.ModelViewSet):
# #     queryset = Category.objects.all()
# #     serializer_class = CategorySerializer

# # class VenueViewSet(viewsets.ModelViewSet):
# #     queryset = Venue.objects.all()
# #     serializer_class = VenueSerializer


# class EventViewSet(viewsets.ModelViewSet):
#     serializer_class = EventSerializer
#     queryset = Event.objects.all()
#     permission_classes = [HasRole.require("STUDENT", "ORGANIZER", "ADMIN")]  # must be logged-in w/ one of these roles

#     # ---- RBAC: query scoping by role & action ----
#     def get_queryset(self):
#         user = self.request.user
#         role = getattr(user, "role", None)
#         role = role.upper() if isinstance(role, str) else role

#         qs = Event.objects.all()

#         # READ access rules
#         if self.action in ["list", "retrieve"]:
#             if role == "ADMIN":
#                 return qs  # everything
#             if role == "ORGANIZER":
#                 # organizers see: their own events (any status) + other APPROVED events
#                 return qs.filter(Q(organizer=user) | Q(status="APPROVED")).distinct()
#             # STUDENT (or default): only APPROVED
#             return qs.filter(status="APPROVED")

#         # WRITE access rules (update/partial_update/destroy/list for selection)
#         if role == "ADMIN":
#             return qs  # admin can edit anything
#         if role == "ORGANIZER":
#             # organizers can only edit their own events
#             return qs.filter(organizer=user)

#         # students cannot write
#         return qs.none()

#     # ---- RBAC: creation ownership & default status ----
#     def perform_create(self, serializer):
#         user = self.request.user
#         role = getattr(user, "role", None)
#         role = role.upper() if isinstance(role, str) else role

#         if role == "ADMIN":
#             # admin can set any organizer/status via payload, but we also allow auto-assign if omitted
#             organizer = serializer.validated_data.get("organizer", user)
#             serializer.save(organizer=organizer)
#             return

#         if role == "ORGANIZER":
#             # organizer creates event for themselves; new events start PENDING
#             serializer.save(organizer=user, status="PENDING")
#             return

#         # students cannot create
#         return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

#     # ---- RBAC: object-level write checks (defense in depth) ----
#     def update(self, request, *args, **kwargs):
#         obj = self.get_object()
#         user = request.user
#         role = getattr(user, "role", None)
#         role = role.upper() if isinstance(role, str) else role

#         if role == "ADMIN" or (role == "ORGANIZER" and obj.organizer_id == user.id):
#             return super().update(request, *args, **kwargs)
#         return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

#     def partial_update(self, request, *args, **kwargs):
#         obj = self.get_object()
#         user = request.user
#         role = getattr(user, "role", None)
#         role = role.upper() if isinstance(role, str) else role

#         if role == "ADMIN" or (role == "ORGANIZER" and obj.organizer_id == user.id):
#             return super().partial_update(request, *args, **kwargs)
#         return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

#     def destroy(self, request, *args, **kwargs):
#         obj = self.get_object()
#         user = request.user
#         role = getattr(user, "role", None)
#         role = role.upper() if isinstance(role, str) else role

#         if role == "ADMIN" or (role == "ORGANIZER" and obj.organizer_id == user.id):
#             return super().destroy(request, *args, **kwargs)
#         return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

#     # ---- ADMIN actions: approve/reject ----
#     @action(detail=True, methods=["post"], permission_classes=[HasRole.require("ADMIN")])
#     def approve(self, request, pk=None):
#         event = self.get_object()
#         event.status = "APPROVED"
#         event.save(update_fields=["status"])
#         return Response({"message": "Event approved", "id": event.id, "status": event.status})

#     @action(detail=True, methods=["post"], permission_classes=[HasRole.require("ADMIN")])
#     def reject(self, request, pk=None):
#         event = self.get_object()
#         event.status = "REJECTED"
#         event.save(update_fields=["status"])
#         return Response({"message": "Event rejected", "id": event.id, "status": event.status})


# from django.db.models import Q
# from rest_framework import status, viewsets
# from rest_framework.decorators import action
# from rest_framework.exceptions import PermissionDenied
# from rest_framework.response import Response

# from .models import Event, Category, Venue
# from .serializers import EventSerializer, CategorySerializer, VenueSerializer

# # Generic role permission you added
# from collegeEventsWeb.user_accounts.permissions import HasRole


# class EventViewSet(viewsets.ModelViewSet):
#     """
#     RBAC rules:
#       - STUDENT: read-only; sees only APPROVED events.
#       - ORGANIZER: can create; can update/delete only own events; sees own (any status) + others' APPROVED.
#       - ADMIN: full access; can approve/reject.
#     """
#     serializer_class = EventSerializer
#     queryset = Event.objects.all()

#     def _role(self, user):
#         role = getattr(user, "role", None)
#         return role.upper() if isinstance(role, str) else role

#     def get_permissions(self):
#         """
#         Use stricter permissions for write/actions; broader for read.
#         """
#         if self.action in ["create", "update", "partial_update", "destroy"]:
#             permission_classes = [HasRole.require("ORGANIZER", "ADMIN")]
#         elif self.action in ["approve", "reject"]:
#             permission_classes = [HasRole.require("ADMIN")]
#         else:  # list / retrieve
#             permission_classes = [HasRole.require("STUDENT", "ORGANIZER", "ADMIN")]
#         return [p() for p in permission_classes]

#     def get_queryset(self):
#         user = self.request.user
#         role = self._role(user)
#         qs = Event.objects.all()

#         # READ paths
#         if self.action in ["list", "retrieve"]:
#             if role == "ADMIN":
#                 return qs
#             if role == "ORGANIZER":
#                 # Own events (any status) + others' APPROVED
#                 return qs.filter(Q(organizer=user) | Q(status="APPROVED")).distinct()
#             # STUDENT or unknown -> only APPROVED
#             return qs.filter(status="APPROVED")

#         # WRITE paths: scope objects eligible for write
#         if role == "ADMIN":
#             return qs
#         if role == "ORGANIZER":
#             return qs.filter(organizer=user)

#         # Students cannot write
#         return qs.none()

#     def perform_create(self, serializer):
#         """
#         Set organizer & default status safely.
#         NOTE: do not return a Response here; raise PermissionDenied for forbidden cases.
#         """
#         user = self.request.user
#         role = self._role(user)

#         if role == "ADMIN":
#             organizer = serializer.validated_data.get("organizer", user)
#             serializer.save(organizer=organizer)
#             return

#         if role == "ORGANIZER":
#             # New organizer-created events start as PENDING
#             serializer.save(organizer=user, status="PENDING")
#             return

#         # Students cannot create events
#         raise PermissionDenied("Students are not allowed to create events.")

#     # Object-level write checks (defense in depth)
#     def update(self, request, *args, **kwargs):
#         obj = self.get_object()
#         role = self._role(request.user)
#         if role == "ADMIN" or (role == "ORGANIZER" and obj.organizer_id == request.user.id):
#             return super().update(request, *args, **kwargs)
#         raise PermissionDenied("Not allowed to update this event.")

#     def partial_update(self, request, *args, **kwargs):
#         obj = self.get_object()
#         role = self._role(request.user)
#         if role == "ADMIN" or (role == "ORGANIZER" and obj.organizer_id == request.user.id):
#             return super().partial_update(request, *args, **kwargs)
#         raise PermissionDenied("Not allowed to modify this event.")

#     def destroy(self, request, *args, **kwargs):
#         obj = self.get_object()
#         role = self._role(request.user)
#         if role == "ADMIN" or (role == "ORGANIZER" and obj.organizer_id == request.user.id):
#             return super().destroy(request, *args, **kwargs)
#         raise PermissionDenied("Not allowed to delete this event.")

#     # ---- ADMIN actions: approve / reject ----
#     @action(detail=True, methods=["post"], permission_classes=[HasRole.require("ADMIN")])
#     def approve(self, request, pk=None):
#         event = self.get_object()
#         event.status = "APPROVED"
#         event.save(update_fields=["status"])
#         return Response({"message": "Event approved", "id": event.id, "status": event.status})

#     @action(detail=True, methods=["post"], permission_classes=[HasRole.require("ADMIN")])
#     def reject(self, request, pk=None):
#         event = self.get_object()
#         event.status = "REJECTED"
#         event.save(update_fields=["status"])
#         return Response({"message": "Event rejected", "id": event.id, "status": event.status})


# class CategoryViewSet(viewsets.ModelViewSet):
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer
#     # Students can read category data too; organizers/admins can manage
#     def get_permissions(self):
#         if self.action in ["create", "update", "partial_update", "destroy"]:
#             permission_classes = [HasRole.require("ORGANIZER", "ADMIN")]
#         else:
#             permission_classes = [HasRole.require("STUDENT", "ORGANIZER", "ADMIN")]
#         return [p() for p in permission_classes]


# class VenueViewSet(viewsets.ModelViewSet):
#     queryset = Venue.objects.all()
#     serializer_class = VenueSerializer
#     # Typically only organizers/admins manage venues
#     def get_permissions(self):
#         if self.action in ["create", "update", "partial_update", "destroy"]:
#             permission_classes = [HasRole.require("ORGANIZER", "ADMIN")]
#         else:
#             permission_classes = [HasRole.require("STUDENT", "ORGANIZER", "ADMIN")]
#         return [p() for p in permission_classes]



# backend/collegeEventsWeb/event_management/views.py
# backend/collegeEventsWeb/event_management/views.py
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Event, Category, Venue
from .serializers import EventSerializer, CategorySerializer, VenueSerializer
from collegeEventsWeb.user_accounts.permissions import HasRole


class EventViewSet(viewsets.ModelViewSet):
    """
    PUBLIC/STUDENT: read-only; sees only APPROVED events.
    ORGANIZER: can create; can update/delete only own; sees own(any status) + others' APPROVED.
    ADMIN: full access; can approve/reject.
    """
    serializer_class = EventSerializer
    queryset = Event.objects.all()

    def _role(self, user):
         role = getattr(user, "role", None)
         return role.lower() if isinstance(role, str) else role  # Use lowercase consistently

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            permission_classes = [HasRole.require("ORGANIZER", "ADMIN")]
        elif self.action in ["approve", "reject"]:
            permission_classes = [HasRole.require("ADMIN")]
        else:  # list / retrieve -> public
            permission_classes = [AllowAny]
        return [p() for p in permission_classes]

    def get_queryset(self):
        user = self.request.user
        role = self._role(user)
        qs = Event.objects.all()

        # READ paths
        if self.action in ["list", "retrieve"]:
            if role == "ADMIN":
                return qs
            if role == "ORGANIZER":
                return qs.filter(
                    Q(organizer=user) | Q(status=Event.Status.APPROVED)
                ).distinct()
            # PUBLIC/STUDENT
            return qs.filter(status=Event.Status.APPROVED)

        # WRITE paths
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

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        role = self._role(request.user)
        if role == "admin" or (role == "organizer" and obj.organizer_id == request.user.id):
            return super().update(request, *args, **kwargs)
        raise PermissionDenied("Not allowed to update this event.")

    def partial_update(self, request, *args, **kwargs):
        obj = self.get_object()
        role = self._role(request.user)
        if role == "admin" or (role == "organizer" and obj.organizer_id == request.user.id):
            return super().partial_update(request, *args, **kwargs)
        raise PermissionDenied("Not allowed to modify this event.")

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        role = self._role(request.user)
        if role == "admin" or (role == "organizer" and obj.organizer_id == request.user.id):
            return super().destroy(request, *args, **kwargs)
        raise PermissionDenied("Not allowed to delete this event.")

    @action(detail=True, methods=["post"], permission_classes=[HasRole.require("ADMIN")])
    def approve(self, request, pk=None):
        event = self.get_object()
        event.status = Event.Status.APPROVED
        event.save(update_fields=["status"])
        return Response({"message": "Event approved", "id": event.id, "status": event.status})

    @action(detail=True, methods=["post"], permission_classes=[HasRole.require("ADMIN")])
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
            permission_classes = [HasRole.require("ORGANIZER", "ADMIN")]
        else:
            permission_classes = [AllowAny]  # public reads
        return [p() for p in permission_classes]


class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            permission_classes = [HasRole.require("ORGANIZER", "ADMIN")]
        else:
            permission_classes = [AllowAny]  # public reads
        return [p() for p in permission_classes]
