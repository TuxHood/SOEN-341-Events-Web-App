from django.contrib import admin
from .models import Category, Venue, Event


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "capacity")
    search_fields = ("name", "address")
    list_filter = ("capacity",)
    ordering = ("name",)
    fieldsets = (
        ("Basic Info", {"fields": ("name", "address")}),
        ("Capacity", {"fields": ("capacity",)}),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "organizer",
        "venue",
        "category",
        "start_time",
        "end_time",
        "is_published",
        "created_at",
    )
    list_filter = ("is_published", "category", "venue", "organizer")
    search_fields = ("title", "description", "venue__name", "organizer__username")
    ordering = ("-created_at",)
    date_hierarchy = "start_time"

    autocomplete_fields = ("organizer", "venue", "category")
    list_select_related = ("organizer", "venue", "category")

    fieldsets = (
        ("Basic Info", {"fields": ("title", "description", "category")}),
        (
            "Schedule",
            {"fields": ("start_time", "end_time")},
        ),
        (
            "Location",
            {"fields": ("venue",)},
        ),
        (
            "Organizer & Status",
            {"fields": ("organizer", "is_published")},
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
    readonly_fields = ("created_at", "updated_at")

    # Optional: automatically set the logged-in admin as the organizer
    def save_model(self, request, obj, form, change):
        if not change and not obj.organizer_id:
            obj.organizer = request.user
        super().save_model(request, obj, form, change)
