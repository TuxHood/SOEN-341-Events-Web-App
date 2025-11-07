# State-only migration to align Ticket.status model field with existing DB column
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event_management', '0010_remove_ticket_checked_in_at_remove_ticket_status'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AddField(
                    model_name='ticket',
                    name='status',
                    field=models.CharField(
                        max_length=20,
                        choices=[('PENDING', 'Pending'), ('CHECKED_IN', 'Checked In'), ('NO_SHOW', 'No Show'), ('CANCELLED', 'Cancelled')],
                        default='PENDING'
                    ),
                ),
            ],
        ),
    ]
