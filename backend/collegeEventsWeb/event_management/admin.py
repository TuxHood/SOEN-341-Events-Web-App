from django.contrib import admin
from .models import Event, Venue, Category

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'venue', 'status', 'is_published', 'start_time', 'end_time')
    list_filter = ('status', 'is_published', 'category')
    search_fields = ('title', 'description')

@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'capacity')
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

