# Generated migration to add organizer FK to Event
from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('event_management', '0006_add_ticket_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='organizer',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='organized_events', to=settings.AUTH_USER_MODEL),
        ),
    ]
