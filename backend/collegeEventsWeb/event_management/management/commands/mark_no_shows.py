from django.core.management.base import BaseCommand
from django.utils import timezone
from ...models import Ticket


class Command(BaseCommand):
    help = 'Mark pending tickets as NO_SHOW when their event has finished.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would be changed but do not write to the database')
        parser.add_argument('--event-id', type=int, help='Optional: only process tickets for a specific event id')

    def handle(self, *args, **options):
        now = timezone.now()
        dry_run = options.get('dry_run')
        event_id = options.get('event_id')

        qs = Ticket.objects.filter(status=Ticket.PENDING, event__end_time__lt=now)
        if event_id:
            qs = qs.filter(event_id=event_id)

        total_pending = qs.count()
        if total_pending == 0:
            self.stdout.write(self.style.SUCCESS('No pending tickets to mark as no-show.'))
            return

        self.stdout.write(f'Found {total_pending} pending ticket(s) where event.end_time < {now.isoformat()}')

        if dry_run:
            # Show a few examples
            examples = qs[:10]
            for t in examples:
                self.stdout.write(f'  Ticket {t.id} (event={t.event_id}) -> would be set to NO_SHOW')
            self.stdout.write(self.style.WARNING('Dry run; no changes were made.'))
            return

        # Perform bulk update: set status=NO_SHOW, checked_in_at=None, is_used=False
        updated = qs.update(status=Ticket.NO_SHOW, checked_in_at=None, is_used=False)

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated} ticket(s) to NO_SHOW.'))
