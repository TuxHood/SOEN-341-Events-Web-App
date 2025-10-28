# from django.db import models
# from collegeEventsWeb.user_accounts.models import User

# class Category(models.Model):
#     name = models.CharField(max_length=255, unique=True)

#     def __str__(self):
#         return self.name

# class Venue(models.Model):
#     name = models.CharField(max_length=255)
#     address = models.TextField()
#     capacity = models.PositiveIntegerField()

#     def __str__(self):
#         return self.name

# class Event(models.Model):
#     title = models.CharField(max_length=255)
#     description = models.TextField()
#     start_time = models.DateTimeField()
#     end_time = models.DateTimeField()
#     venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='events')
#     organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
#     category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
#     is_published = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.title


from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Category(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=120, unique=True)

    def __str__(self):
        return self.name

class Venue(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=255, blank=True)
    capacity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class Event(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    venue = models.ForeignKey(Venue, null=True, blank=True, on_delete=models.SET_NULL)
    organizer = models.ForeignKey(User, related_name="events", on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title