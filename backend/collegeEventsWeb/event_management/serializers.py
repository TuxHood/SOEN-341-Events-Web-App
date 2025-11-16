import os, qrcode
from rest_framework import serializers
from .models import Event, Category, Venue, Ticket
from django.conf import settings
#from collegeEventsWeb.ticket_services.models import Ticket
from io import BytesIO
from django.core.files.base import ContentFile


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = '__all__'
class EventSerializer(serializers.ModelSerializer):
    # Read-only extras for the UI
    organizer = serializers.PrimaryKeyRelatedField(read_only=True)
    organizer_name = serializers.SerializerMethodField(read_only=True)
    category_name  = serializers.SerializerMethodField(read_only=True)
    image_url      = serializers.SerializerMethodField(read_only=True)
    tickets_issued = serializers.SerializerMethodField(read_only=True)
    tickets_checked_in = serializers.SerializerMethodField(read_only=True)
    tickets_pending = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "organizer",
            "is_approved",
            "rejection_reason",
            "title",
            "description",
            "start_time",   
            "organization",
            "end_time",   
            "category",     
            "organizer_name",
            "tickets_issued",
            "tickets_checked_in",
            "tickets_pending",
            "category_name",
            "image_url",
        ]
        read_only_fields = ["organizer", "organizer_name", "category_name", "image_url", "tickets_issued", "tickets_checked_in", "tickets_pending"]

    # ---- helpers ----
    def get_organizer_name(self, obj):
        # Try common field names for the organizer relation
        for attr in ("organizer", "user", "created_by", "owner", "host"):
            u = getattr(obj, attr, None)
            if u:
                full = f"{getattr(u, 'first_name', '')} {getattr(u, 'last_name', '')}".strip()
                return full or getattr(u, "username", None) or getattr(u, "email", None)
        return None

    def get_category_name(self, obj):
        c = getattr(obj, "category", None)
        return getattr(c, "name", None) if c else None

    def get_image_url(self, obj):
        # Return the stored image_url if provided, otherwise fall back to a
        # sensible default (same as used by the frontend discovery view).
        img = getattr(obj, "image_url", None) or ""
        img = img.strip()
        if img:
            return img
        # Default Unsplash placeholder used in the frontend when no image is set
        return (
            "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?q=80&w=800&auto=format&fit=crop"
        )

    def get_tickets_issued(self, obj):
        try:
            return obj.event_management_tickets.count()
        except Exception:
            return 0

    def get_tickets_checked_in(self, obj):
        try:
            return obj.event_management_tickets.filter(is_used=True).count()
        except Exception:
            return 0

    def get_tickets_pending(self, obj):
        try:
            issued = obj.event_management_tickets.count()
            checked = obj.event_management_tickets.filter(is_used=True).count()
            return max(issued - checked, 0)
        except Exception:
            return 0

    #def get_image_url(self, obj):
        #img = getattr(obj, "image", None)
        #if not img:
            #return None
        #try:
            #url = img.url
        #except Exception:
            #return None
        #req = self.context.get("request")
        #return req.build_absolute_uri(url) if req else url
    

class TicketSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    qr_png_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Ticket
        fields = ["id", "event", "owner", "qr", "is_used", "qr_png_url"]
        extra_kwargs = {"owner": {"write_only": True}}

    def get_qr_png_url(self, obj):
        # If an image was saved to the ImageField, return its URL
        try:
            if getattr(obj, "qr", None):
                url = obj.qr.url
                request = self.context.get("request")
                return request.build_absolute_uri(url) if request else url
        except Exception:
            pass
        return None