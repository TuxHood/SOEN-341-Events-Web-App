from django.db import models
from django.conf import settings
from io import BytesIO
import uuid
from django.core.files.base import ContentFile
from django.utils import timezone
import qrcode
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Venue(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    capacity = models.PositiveIntegerField()

    def __str__(self):
        return self.name

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    organization = models.CharField(max_length=120)
    category = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    image_url = models.URLField(blank=True)
    price_cents = models.PositiveIntegerField(default=0)
    # Admin approval flag: new events created by organizers are set False and
    # require admin approval before being visible in public listings.
    is_approved = models.BooleanField(default=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Optional organizer FK: some forks of this project include it, add as nullable for compatibility
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='events'
    )

    def __str__(self):
        return f"{self.title} @ {self.start_time:%Y-%m-%d %H:%M}"


class CalendarEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="calendar_entries"
    )
    event = models.ForeignKey('Event', on_delete=models.CASCADE, related_name="registrations")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "event")  

    def __str__(self):
        return f"{self.user} → {self.event}"

class Payment(models.Model):
    PENDING, SUCCESS, FAILED = "PENDING", "SUCCESS", "FAILED"
    STATUS_CHOICES = [(PENDING, "PENDING"), (SUCCESS, "SUCCESS"), (FAILED, "FAILED")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE,
                             related_name="payments")
    event = models.ForeignKey('Event', on_delete=models.CASCADE, related_name="payments")
    amount_cents = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(default=timezone.now)
    card_last4 = models.CharField(max_length=4, blank=True)

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(
    Event,
    on_delete=models.CASCADE,
    related_name="event_management_tickets"
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="event_management_tickets_owned")
    qr = models.ImageField(upload_to="qr_codes/", null=True, blank=True)  # ✅ new field
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    # Restore legacy status column that still exists in some DBs to avoid NOT NULL violations
    PENDING, CHECKED_IN, NO_SHOW, CANCELLED = "PENDING", "CHECKED_IN", "NO_SHOW", "CANCELLED"
    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (CHECKED_IN, "Checked In"),
        (NO_SHOW, "No Show"),
        (CANCELLED, "Cancelled"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    def __str__(self):
        return f"Ticket {self.id} - {self.event}"