from django.apps import AppConfig


class TicketServicesConfig(AppConfig):
    """AppConfig for the ticket_services app.

    Use the top-level package name 'ticket_services' to match INSTALLED_APPS.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ticket_services'
    label = 'ticket_services'
