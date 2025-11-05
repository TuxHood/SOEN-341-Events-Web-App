from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from ...models import Event, Venue, Category
from ticket_services.models import Ticket
from user_accounts.models import User


class Command(BaseCommand):
    help = 'Creates sample data for testing the Event Analytics Dashboard'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')

        # Create or get a test organizer
        organizer, created = User.objects.get_or_create(
            email='organizer@example.com',
            defaults={
                'name': 'Test Organizer',
                'role': 'organizer'
            }
        )
        if created:
            organizer.set_password('testpass123')
            organizer.save()
            self.stdout.write(self.style.SUCCESS(f'Created organizer: {organizer.email}'))
        else:
            self.stdout.write(f'Using existing organizer: {organizer.email}')

        # Create or get test attendees
        attendees = []
        for i in range(1, 6):
            attendee, created = User.objects.get_or_create(
                email=f'attendee{i}@example.com',
                defaults={
                    'name': f'Test Attendee {i}',
                    'role': 'student'
                }
            )
            if created:
                attendee.set_password('testpass123')
                attendee.save()
            attendees.append(attendee)
        
        self.stdout.write(self.style.SUCCESS(f'Created/found {len(attendees)} attendees'))

        # Create categories
        categories_data = ['Concert', 'Workshop', 'Conference', 'Sports', 'Social']
        categories = []
        for cat_name in categories_data:
            category, created = Category.objects.get_or_create(name=cat_name)
            categories.append(category)
        self.stdout.write(self.style.SUCCESS(f'Created/found {len(categories)} categories'))

        # Create venues
        venues_data = [
            {'name': 'Main Auditorium', 'address': '123 Campus Drive', 'capacity': 200},
            {'name': 'Student Center', 'address': '456 University Ave', 'capacity': 150},
            {'name': 'Sports Complex', 'address': '789 College Road', 'capacity': 300},
        ]
        venues = []
        for venue_data in venues_data:
            venue, created = Venue.objects.get_or_create(
                name=venue_data['name'],
                defaults={
                    'address': venue_data['address'],
                    'capacity': venue_data['capacity']
                }
            )
            venues.append(venue)
        self.stdout.write(self.style.SUCCESS(f'Created/found {len(venues)} venues'))

        # Create events
        events_data = [
            {
                'title': 'Spring Concert 2025',
                'description': 'Annual spring music festival featuring local bands and artists.',
                'venue': venues[0],
                'category': categories[0],
                'tickets_to_issue': 150,
                'tickets_checked_in': 120,
                'days_from_now': 30,
            },
            {
                'title': 'Python Workshop',
                'description': 'Learn advanced Python programming techniques.',
                'venue': venues[1],
                'category': categories[1],
                'tickets_to_issue': 100,
                'tickets_checked_in': 85,
                'days_from_now': 15,
            },
            {
                'title': 'Tech Conference 2025',
                'description': 'Annual technology and innovation conference.',
                'venue': venues[2],
                'category': categories[2],
                'tickets_to_issue': 250,
                'tickets_checked_in': 180,
                'days_from_now': 45,
            },
            {
                'title': 'Basketball Tournament',
                'description': 'Inter-college basketball championship.',
                'venue': venues[2],
                'category': categories[3],
                'tickets_to_issue': 200,
                'tickets_checked_in': 200,
                'days_from_now': 7,
            },
            {
                'title': 'Networking Night',
                'description': 'Meet fellow students and professionals.',
                'venue': venues[1],
                'category': categories[4],
                'tickets_to_issue': 80,
                'tickets_checked_in': 45,
                'days_from_now': 3,
            },
        ]

        for event_data in events_data:
            # Check if event already exists. Our Event model stores simple fields
            # (organization and category are plain text), so convert related
            # Venue/Category objects into strings before creating.
            org_name = event_data['venue'].name if hasattr(event_data['venue'], 'name') else str(event_data['venue'])
            cat_name = event_data['category'].name if hasattr(event_data['category'], 'name') else str(event_data['category'])

            event, created = Event.objects.get_or_create(
                title=event_data['title'],
                defaults={
                    'description': event_data['description'],
                    'start_time': timezone.now() + timedelta(days=event_data['days_from_now'], hours=18),
                    'end_time': timezone.now() + timedelta(days=event_data['days_from_now'], hours=22),
                    'organization': org_name,
                    'category': cat_name,
                    'image_url': '',
                    'price_cents': 0,
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created event: {event.title}'))
                
                # Create tickets for this event. The Ticket model enforces a
                # unique constraint (event, owner) so create/get to avoid errors.
                tickets_to_create = event_data['tickets_to_issue']
                tickets_checked_in = event_data['tickets_checked_in']

                created_count = 0
                for i in range(tickets_to_create):
                    # Cycle through attendees
                    attendee = attendees[i % len(attendees)]

                    ticket, tcreated = Ticket.objects.get_or_create(
                        event=event,
                        owner=attendee,
                    )
                    if tcreated:
                        created_count += 1

                    # Mark some tickets as checked in (only mark if newly created)
                    if tcreated and i < tickets_checked_in:
                        ticket.is_used = True
                        ticket.save()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  Created {tickets_to_create} tickets ({tickets_checked_in} checked in)'
                    )
                )
            else:
                self.stdout.write(f'Event already exists: {event.title}')

        self.stdout.write(self.style.SUCCESS('\n✅ Sample data creation complete!'))
        self.stdout.write('\nYou can now test the analytics dashboard at:')
        self.stdout.write('  http://localhost:5173/events/1/analytics')
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('  Organizer: organizer@example.com / testpass123')
        self.stdout.write('  Attendees: attendee1@example.com / testpass123')
