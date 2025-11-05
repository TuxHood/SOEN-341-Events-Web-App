from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "id",
            "event",
            "owner",
            "qr_code",
            "qr",
            "is_used",
            "created_at",
        ]
        read_only_fields = ["id", "owner", "created_at"]
