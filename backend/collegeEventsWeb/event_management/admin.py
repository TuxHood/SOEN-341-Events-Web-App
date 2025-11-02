# collegeEventsWeb/event_management/admin.py
from django.contrib import admin
from .models import Event, Payment, CalendarEntry
from collegeEventsWeb.ticket_services.models import Ticket

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "organization", "start_time", "end_time")
    search_fields = ("title", "organization", "category")
    list_filter = ("category", "organization")

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "owner", "is_used", "created_at")
    search_fields = ("id",)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    # amount_cents exists; show a pretty $ column
    list_display = ("id", "user", "event", "amount", "status", "created_at", "card_last4")
    list_filter = ("status",)
    search_fields = ("user__email", "event__title", "card_last4")

    def amount(self, obj):
        # format cents as dollars like $12.34
        return f"${obj.amount_cents/100:.2f}"
    amount.short_description = "Amount"
    amount.admin_order_field = "amount_cents"

@admin.register(CalendarEntry)
class CalendarEntryAdmin(admin.ModelAdmin):
    # CalendarEntry doesn’t have start/end; show the event’s times via methods
    list_display = ("id", "event", "user", "event_start", "event_end", "created_at")
    search_fields = ("event__title", "user__email")

    def event_start(self, obj):
        return getattr(obj.event, "start_time", None)
    event_start.short_description = "Event start"
    event_start.admin_order_field = "event__start_time"

    def event_end(self, obj):
        return getattr(obj.event, "end_time", None)
    event_end.short_description = "Event end"
    event_end.admin_order_field = "event__end_time"
