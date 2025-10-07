from django.db import models
from django.contrib.auth.hashers import make_password

class User(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('organizer', 'Organizer'),
        ('admin', 'Admin'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('suspended', 'Suspended'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def __str__(self):
        return f"{self.name} ({self.role})"
