"""
Generate sample venues, events, organizers and student registrations.

Run from repository root (Python venv activated):

  python scripts/generate_sample_data.py --venues 3 --events-per-venue 4 --students 30 --organizers 4 --registrations-per-event 8

The script initializes Django, creates users, venues, events and tickets/calendar entries.
"""
import os
import sys
import argparse
import random
from datetime import timedelta


def configure_django():
    # Ensure the project package (collegeEventsWeb) is importable.
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    project_root = os.path.join(repo_root, 'backend', 'collegeEventsWeb')
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'collegeEventsWeb.settings')
    import django

    django.setup()


def make_users(User, count, role='student'):
    users = []
    for i in range(1, count + 1):
        email = f'{role}{i}@example.com'
        name = f'{role.title()} {i}'
        # Use a simple password for dev only
        u = User.objects.create_user(email=email, name=name, password='password')
        if role == 'organizer':
            u.role = 'organizer'
            u.status = 'active'
            u.is_approved_organizer = True
            u.save()
        users.append(u)
    return users


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--venues', type=int, default=3)
    parser.add_argument('--events-per-venue', type=int, default=4)
    parser.add_argument('--students', type=int, default=30)
    parser.add_argument('--organizers', type=int, default=3)
    parser.add_argument('--registrations-per-event', type=int, default=8)
    args = parser.parse_args(argv)

    configure_django()

    from django.utils import timezone
    from django.contrib.auth import get_user_model
    from event_management.models import Venue, Event, Ticket, CalendarEntry

    User = get_user_model()

    print('Creating organizers...')
    organizers = make_users(User, args.organizers, role='organizer')

    print('Creating students...')
    students = make_users(User, args.students, role='student')

    print('Creating venues...')
    venues = []
    for i in range(1, args.venues + 1):
        v = Venue.objects.create(
            name=f'Venue {i}',
            address=f'{100 + i} Example St, City',
            capacity=100 + i * 50,
        )
        venues.append(v)

    print('Creating events...')
    events = []
    now = timezone.now()
    for v in venues:
        for j in range(args.events_per_venue):
            start = now + timedelta(days=random.randint(1, 60) + j)
            end = start + timedelta(hours=2)
            organizer = random.choice(organizers) if organizers else None
            ev = Event.objects.create(
                title=f'Event {v.id}-{j+1}',
                description='Sample generated event',
                organization='Sample Org',
                category='General',
                start_time=start,
                end_time=end,
                image_url='',
                price_cents=0,
                is_approved=True,
                organizer=organizer,
                
            )
            # Optionally link venue if model has 'venue' field
            try:
                if hasattr(ev, 'venue'):
                    ev.venue = v
                    ev.save()
            except Exception:
                pass
            events.append(ev)

    print('Registering students for events...')
    for ev in events:
        registrants = random.sample(students, min(args.registrations_per_event, len(students)))
        for s in registrants:
            # Create a Ticket for the user for the event where applicable
            try:
                t = Ticket.objects.create(event=ev, owner=s)
            except Exception:
                # Fallback to CalendarEntry if Ticket cannot be created
                try:
                    CalendarEntry.objects.create(user=s, event=ev)
                except Exception:
                    pass

    print('Summary:')
    print(f'  Organizers: {len(organizers)}')
    print(f'  Students:   {len(students)}')
    print(f'  Venues:     {len(venues)}')
    print(f'  Events:     {len(events)}')
    total_tickets = Ticket.objects.count()
    print(f'  Tickets:    {total_tickets}')


if __name__ == '__main__':
    main()
