# from django.db import models
# from django.utils import timezone
# from django.contrib.auth.models import (
#     AbstractBaseUser, PermissionsMixin, BaseUserManager
# )


# class UserManager(BaseUserManager):
#     def create_user(self, email, name, password=None, role="student", status="active", **extra_fields):
#         if not email:
#             raise ValueError("Users must have an email address")
#         if not name:
#             raise ValueError("Users must have a name")
#         email = self.normalize_email(email)

#         user = self.model(
#             email=email,
#             name=name,
#             role=role,
#             status=status,
#             **extra_fields,
#         )
#         user.set_password(password)  # stored in db column password_hash via db_column mapping
#         user.is_active = (status == User.Status.ACTIVE)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, email, name, password=None, **extra_fields):
#         extra_fields.setdefault("role", User.Role.ADMIN)
#         extra_fields.setdefault("status", User.Status.ACTIVE)
#         extra_fields.setdefault("is_staff", True)
#         extra_fields.setdefault("is_superuser", True)

#         if extra_fields.get("is_staff") is not True:
#             raise ValueError("Superuser must have is_staff=True.")
#         if extra_fields.get("is_superuser") is not True:
#             raise ValueError("Superuser must have is_superuser=True.")

#         return self.create_user(email, name, password, **extra_fields)


# class User(AbstractBaseUser, PermissionsMixin):
#     class Role(models.TextChoices):
#         STUDENT = "student", "Student"
#         ORGANIZER = "organizer", "Organizer"
#         ADMIN = "admin", "Admin"

#     class Status(models.TextChoices):
#         ACTIVE = "active", "Active"
#         PENDING = "pending", "Pending"
#         SUSPENDED = "suspended", "Suspended"

#     id = models.BigAutoField(primary_key=True)

#     name = models.CharField(max_length=255)
#     email = models.EmailField(unique=True)

#     # Keep Django's field name `password` but map to DB column `password_hash`.
#     password = models.CharField(max_length=128, db_column="password_hash")

#     role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
#     status = models.CharField(
#         max_length=10,
#         choices=Status.choices,
#         default=Status.ACTIVE,
#         help_text="Used for organizer approval and general account state.",
#     )

#     # Organizer Approval Fields
#     is_organizer = models.BooleanField(default=False)
#     is_approved_organizer = models.BooleanField(default=False)
#     approval_requested_at = models.DateTimeField(null=True, blank=True)
#     approved_at = models.DateTimeField(null=True, blank=True)
#     reviewed_by = models.ForeignKey(
#         'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_users'
#     )

#     created_at = models.DateTimeField(default=timezone.now, editable=False)
#     updated_at = models.DateTimeField(auto_now=True)

#     # Django admin flags
#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)

#     objects = UserManager()

#     USERNAME_FIELD = "email"
#     REQUIRED_FIELDS = ["name"]

#     class Meta:
#         db_table = "users"
#         indexes = [
#             models.Index(fields=["email"]),
#             models.Index(fields=["role"]),
#             models.Index(fields=["status"]),
#         ]

#     def save(self, *args, **kwargs):
#         # Keep is_active consistent with status
#         self.is_active = (self.status == self.Status.ACTIVE)
#         # Admins are staff by default
#         if self.role == self.Role.ADMIN:
#             self.is_staff = True
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.name} <{self.email}>"

#     # Convenience methods for admin workflow
#     def request_organizer_approval(self):
#         self.is_organizer = True
#         self.status = self.Status.PENDING
#         self.approval_requested_at = timezone.now()
#         self.save()

#     def approve_organizer(self, admin_user):
#         self.is_approved_organizer = True
#         self.status = self.Status.ACTIVE
#         self.approved_at = timezone.now()
#         self.reviewed_by = admin_user
#         self.save()

#     def reject_organizer(self, admin_user):
#         self.is_approved_organizer = False
#         self.status = self.Status.SUSPENDED
#         self.reviewed_by = admin_user
#         self.save()
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import (
    AbstractBaseUser, PermissionsMixin, BaseUserManager
)


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, role="student", status="active", **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        if not name:
            raise ValueError("Users must have a name")
        email = self.normalize_email(email)

        user = self.model(
            email=email,
            name=name,
            role=role,
            status=status,
            **extra_fields,
        )
        user.set_password(password)
        user.is_active = (status == User.Status.ACTIVE)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("status", User.Status.ACTIVE)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        ORGANIZER = "organizer", "Organizer"
        ADMIN = "admin", "Admin"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending"
        REJECTED = "rejected", "Rejected"  # Changed from SUSPENDED for clarity

    id = models.BigAutoField(primary_key=True)

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, db_column="password_hash")

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE,
        help_text="Used for organizer approval and general account state.",
    )

    # REMOVED: is_organizer, is_approved_organizer - Using role field instead
    approval_requested_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_users'
    )

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    # Django admin flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
            models.Index(fields=["status"]),
        ]

    def save(self, *args, **kwargs):
        # Keep is_active consistent with status
        self.is_active = (self.status == self.Status.ACTIVE)
        # Admins are staff by default
        if self.role == self.Role.ADMIN:
            self.is_staff = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} <{self.email}>"

    # Convenience methods for admin workflow
    def request_organizer_approval(self):
        self.role = self.Role.ORGANIZER
        self.status = self.Status.PENDING
        self.approval_requested_at = timezone.now()
        self.save()

    def approve_organizer(self, admin_user):
        self.status = self.Status.ACTIVE
        self.approved_at = timezone.now()
        self.reviewed_by = admin_user
        self.save()

    def reject_organizer(self, admin_user):
        self.status = self.Status.REJECTED
        self.reviewed_by = admin_user
        self.save()

    # Property for convenience
    @property
    def is_organizer(self):
        return self.role == self.Role.ORGANIZER

    @property
    def is_approved_organizer(self):
        return self.role == self.Role.ORGANIZER and self.status == self.Status.ACTIVE