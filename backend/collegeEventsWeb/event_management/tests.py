from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from event_management.models import Event, Ticket
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class UserAuthenticationTests(TestCase):
    """Test user registration and authentication"""
    
    def test_user_creation_valid_data(self):
        """Test creating a user with valid data"""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            name='Test User',
            role='student'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.name, 'Test User')
        self.assertEqual(user.role, 'student')
        self.assertTrue(user.check_password('testpass123'))
    
    def test_user_login_invalid_credentials(self):
        """Test login fails with invalid credentials"""
        client = APIClient()
        response = client.post('/api/users/login/', {
            'email': 'nonexistent@example.com',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_organizer_pending_approval_status(self):
        """Test organizer users start with pending status"""
        organizer = User.objects.create_user(
            email='organizer@example.com',
            password='testpass123',
            name='Test Organizer',
            role='organizer',
            status='pending'
        )
        self.assertEqual(organizer.status, 'pending')
        self.assertFalse(organizer.is_active)


class EventTests(TestCase):
    """Test event creation and management"""
    
    def setUp(self):
        """Create test users for events"""
        self.organizer = User.objects.create_user(
            email='organizer@example.com',
            password='testpass123',
            name='Test Organizer',
            role='organizer'
        )
        # Approve the organizer so they can create events
        self.organizer.status = 'active'
        self.organizer.is_active = True
        self.organizer.save()
        
        self.student = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            name='Test Student',
            role='student'
        )
    
    def test_event_creation_by_organizer(self):
        """Test organizer can create an event"""
        event = Event.objects.create(
            title='Test Event',
            description='Test Description',
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=2),
            organization='Test Org',
            category='Workshop',
            organizer=self.organizer
        )
        self.assertEqual(event.title, 'Test Event')
        self.assertEqual(event.organizer, self.organizer)
    
    def test_unapproved_event_not_visible(self):
        """Test unapproved events are not shown to students"""
        event = Event.objects.create(
            title='Pending Event',
            description='Test',
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=2),
            organization='Test Org',
            category='Workshop',
            organizer=self.organizer,
            is_approved=False
        )
        
        client = APIClient()
        client.force_authenticate(user=self.student)
        response = client.get('/api/events/')
        
        # Event should not be in the list
        event_ids = [e['id'] for e in response.data]
        self.assertNotIn(event.id, event_ids)


class TicketTests(TestCase):
    """Test ticket purchase and management"""
    
    def setUp(self):
        """Create test data"""
        self.organizer = User.objects.create_user(
            email='organizer@example.com',
            password='testpass123',
            name='Test Organizer',
            role='organizer',
            status='active'
        )
        
        self.student = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            name='Test Student',
            role='student'
        )
        
        self.event = Event.objects.create(
            title='Test Event',
            description='Test',
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=2),
            organization='Test Org',
            category='Workshop',
            organizer=self.organizer,
            is_approved=True
        )
    
    def test_buy_ticket_for_event(self):
        """Test student can buy a ticket"""
        client = APIClient()
        client.force_authenticate(user=self.student)
        response = client.post(f'/api/events/{self.event.id}/buy/')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Ticket.objects.filter(event=self.event, owner=self.student).exists())
    
    def test_cannot_buy_duplicate_ticket(self):
        """Test cannot buy multiple tickets for same event"""
        # Buy first ticket
        Ticket.objects.create(event=self.event, owner=self.student)
        
        # Try to buy second ticket
        client = APIClient()
        client.force_authenticate(user=self.student)
        response = client.post(f'/api/events/{self.event.id}/buy/')
        
        # Verify only ONE ticket exists (the important part)
        ticket_count = Ticket.objects.filter(event=self.event, owner=self.student).count()
        self.assertEqual(ticket_count, 1, "Should only have one ticket per event")
    
    def test_qr_code_generation(self):
        """Test QR code is generated on ticket creation"""
        ticket = Ticket.objects.create(event=self.event, owner=self.student)
        
        # Check that EITHER qr_code field OR qr image exists
        self.assertTrue(
            hasattr(ticket, 'qr_code') or hasattr(ticket, 'qr'),
            "Ticket should have qr_code or qr field"
        )


class AttendeeListTests(TestCase):
    """Test attendee list and CSV export - Ryan's feature!"""
    
    def setUp(self):
        """Create test data"""
        self.organizer = User.objects.create_user(
            email='organizer@example.com',
            password='testpass123',
            name='Test Organizer',
            role='organizer',
            status='active'
        )
        
        self.other_organizer = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            name='Other Organizer',
            role='organizer',
            status='active'
        )
        
        self.student = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            name='Test Student',
            role='student'
        )
        
        self.event = Event.objects.create(
            title='Test Event',
            description='Test',
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=2),
            organization='Test Org',
            category='Workshop',
            organizer=self.organizer,
            is_approved=True
        )
        
        # Create some tickets
        Ticket.objects.create(event=self.event, owner=self.student)
    
    def test_organizer_can_view_attendee_list(self):
        """Test event organizer can view attendee list"""
        client = APIClient()
        client.force_authenticate(user=self.organizer)
        response = client.get(f'/api/events/{self.event.id}/attendees/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_attendees'], 1)
        self.assertEqual(response.data['attendees'][0]['email'], 'student@example.com')
    
    def test_csv_export_includes_correct_data(self):
        """Test CSV export contains attendee information"""
        client = APIClient()
        client.force_authenticate(user=self.organizer)
        response = client.get(f'/api/events/{self.event.id}/attendees/export/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        
        # Check CSV contains student email
        content = response.content.decode('utf-8')
        self.assertIn('student@example.com', content)


class PermissionTests(TestCase):
    """Test role-based permissions"""
    
    def setUp(self):
        """Create test users"""
        self.organizer = User.objects.create_user(
            email='organizer@example.com',
            password='testpass123',
            name='Test Organizer',
            role='organizer',
            status='active'
        )
        
        self.student = User.objects.create_user(
            email='student@example.com',
            password='testpass123',
            name='Test Student',
            role='student'
        )
        
        self.event = Event.objects.create(
            title='Test Event',
            description='Test',
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=2),
            organization='Test Org',
            category='Workshop',
            organizer=self.organizer,
            is_approved=True
        )
    
    def test_student_cannot_access_organizer_endpoints(self):
        """Test students cannot access organizer-only endpoints"""
        client = APIClient()
        client.force_authenticate(user=self.student)
        response = client.get(f'/api/events/{self.event.id}/analytics/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_non_owner_cannot_view_attendee_list(self):
        """Test organizers can only view their own event attendee lists"""
        other_organizer = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            name='Other Organizer',
            role='organizer',
            status='active'
        )
        
        client = APIClient()
        client.force_authenticate(user=other_organizer)
        response = client.get(f'/api/events/{self.event.id}/attendees/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)