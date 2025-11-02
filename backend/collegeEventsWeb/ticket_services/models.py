import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from collegeEventsWeb.event_management.models import Event


class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="tickets"  # used by analytics & queries above
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tickets"
    )

    # Textual QR payload (stable for apps that render QR client-side)
    qr_code = models.CharField(max_length=255, blank=True)

    # Optional PNG file (server-generated) — used by buy_ticket()
    qr = models.ImageField(upload_to="tickets/", blank=True, null=True)

    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["event", "owner"],
                name="unique_ticket_per_event_owner",
            ),
        ]

    def save(self, *args, **kwargs):
        # Provide a deterministic textual payload the frontend can encode as a QR if needed
        if not self.qr_code:
            self.qr_code = f"{self.event_id}:{self.owner_id}:{self.id}"
        return super().save(*args, **kwargs)

    def __str__(self):
        owner_display = (
            getattr(self.owner, "email", None)
            or getattr(self.owner, "username", None)
            or str(self.owner_id)
        )
        event_title = getattr(self.event, "title", None) or f"Event {self.event_id}"
        return f"Ticket for {event_title} owned by {owner_display}"
