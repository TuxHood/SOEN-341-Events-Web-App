import uuid
from django.db import models
from django.conf import settings
from collegeEventsWeb.event_management.models import Event

User = settings.AUTH_USER_MODEL

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    quantity = models.PositiveIntegerField(default=1)
    qr_code = models.CharField(max_length=255, unique=True, blank=True)
    is_used = models.BooleanField(default=False)
    purchased_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self.qr_code = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Ticket for {self.event.title} owned by {self.buyer.email}"