from django.apps import AppConfig


class EventManagementConfig(AppConfig):
    """AppConfig for the event_management app.

    Use the top-level package name 'event_management' so it matches
    INSTALLED_APPS entry and the app package layout in the repo.
    """
    default_auto_field = "django.db.models.BigAutoField"
    name = "event_management"
    label = "event_management"