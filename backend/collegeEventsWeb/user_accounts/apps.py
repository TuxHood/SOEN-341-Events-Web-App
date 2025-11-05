from django.apps import AppConfig


class UserAccountsConfig(AppConfig):
    """AppConfig for the user_accounts app.

    Use the top-level package name 'user_accounts' to match INSTALLED_APPS.
    """
    default_auto_field = "django.db.models.BigAutoField"
    name = "user_accounts"
    label = "user_accounts"