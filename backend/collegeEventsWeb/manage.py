#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'collegeEventsWeb.settings')

    # Convenience shortcut: allow `python manage.py generate_events` to
    # invoke the `create_sample_data` management command (useful for dev).
    if len(sys.argv) > 1 and sys.argv[1] in ("generate_events", "create_sample_data_local"):
        # Import and run Django setup then call the management command directly
        try:
            import django
            from django.core.management import call_command
        except ImportError as exc:
            raise ImportError(
                "Couldn't import Django. Are you sure it's installed and "
                "available on your PYTHONPATH environment variable? Did you "
                "forget to activate a virtual environment?"
            ) from exc

        django.setup()
        # forward to the project's management command
        call_command('create_sample_data')
        return

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
