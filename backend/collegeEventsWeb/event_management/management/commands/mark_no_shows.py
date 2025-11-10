from django.core.management.base import BaseCommand
from django.utils import timezone
from ...models import Ticket


class Command(BaseCommand):
    help = 'Report derived no-shows for events that have ended. (Legacy: used to set Ticket.status=NO_SHOW)'

    def add_arguments(self, parser):
        parser.add_argument('--event-id', type=int, help='Optional: only process tickets for a specific event id')
        parser.add_argument('--limit', type=int, default=10, help='Print at most N example tickets')

    def handle(self, *args, **options):
        now = timezone.now()
        event_id = options.get('event_id')
        limit = options.get('limit') or 10

        # The Ticket model no longer has a status/checked_in_at field. A no-show is
        # derived as: tickets for ended events where is_used=False.
        qs = Ticket.objects.filter(event__end_time__lt=now, is_used=False)
        if event_id:
            qs = qs.filter(event_id=event_id)

        total_no_shows = qs.count()
        if total_no_shows == 0:
            self.stdout.write(self.style.SUCCESS('No derived no-shows found.'))
            return

        self.stdout.write(f'Derived no-shows: {total_no_shows} ticket(s) where event.end_time < {now.isoformat()} and is_used=False')
        for t in qs.select_related('event', 'owner')[:limit]:
            self.stdout.write(f'  Ticket {t.id} (event={getattr(t.event, "title", t.event_id)}) owner={getattr(t.owner, "email", t.owner_id)}')
        self.stdout.write(self.style.NOTICE('Note: Ticket.status has been removed; this command is report-only now.'))
