# from rest_framework import serializers
# from .models import Ticket

# class TicketSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Ticket
#         fields = '__all__'


from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ["id", "event", "buyer", "quantity", "qr_code", "is_used", "purchased_at"]
        read_only_fields = ["purchased_at", "qr_code"]