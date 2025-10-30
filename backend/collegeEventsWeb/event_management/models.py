from django.db import models
from user_accounts.models import User

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
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='events')
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')

    # Moderation fields
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_events')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    # Other
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


