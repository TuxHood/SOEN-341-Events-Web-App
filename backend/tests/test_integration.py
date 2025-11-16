from django.test import override_settings
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model

from event_management.models import Event, Venue, Ticket


User = get_user_model()


class IntegrationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def _make_token(self, user):
        return str(RefreshToken.for_user(user).access_token)

    def test_get_csrf_sets_cookie(self):
        resp = self.client.get('/api/users/csrf/')
        self.assertEqual(resp.status_code, 200)
        # Response should instruct the browser to set a csrftoken cookie
        self.assertIn('csrftoken', resp.cookies)

    def test_register_and_login_sets_access_cookie(self):
        # register
        data = {"name": "Test User", "email": "t1@example.com", "password": "complexpwd"}
        resp = self.client.post('/api/users/register/', data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        # login should set httponly access_token cookie and return tokens
        resp = self.client.post('/api/users/login/', {"email": "t1@example.com", "password": "complexpwd"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', resp.cookies)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_logout_deletes_cookie(self):
        u = User.objects.create_user(email='a1@example.com', name='A1', password='password123')
        token = self._make_token(u)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        # call logout endpoint
        resp = self.client.post('/api/users/logout/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # logout view should set a cookie deletion for access_token
        self.assertIn('access_token', resp.cookies)
        # deleted cookie typically has max-age 0
        self.assertTrue(resp.cookies['access_token']['max-age'] in (0, '0'))

    def test_me_requires_auth_and_returns_user(self):
        # unauthenticated
        resp = self.client.get('/api/users/me/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        u = User.objects.create_user(email='me1@example.com', name='Me1', password='passw0rd')
        token = self._make_token(u)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.get('/api/users/me/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get('email'), 'me1@example.com')

    def test_event_list_hides_unapproved_for_public_but_retrieve_by_owner(self):
        owner = User.objects.create_user(email='org@example.com', name='Org', password='pwd')
        # create unapproved event
        start = timezone.now() + timezone.timedelta(days=1)
        end = start + timezone.timedelta(hours=2)
        ev = Event.objects.create(title='Secret', description='x', organization='Org', category='General', start_time=start, end_time=end, is_approved=False, organizer=owner)

        # public listing should not include it
        resp = self.client.get('/api/events/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertNotIn(ev.id, [e.get('id') for e in resp.data])

        # owner should be able to retrieve it
        token = self._make_token(owner)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.get(f'/api/events/{ev.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get('title'), 'Secret')

    def test_buy_ticket_idempotent_and_requires_auth(self):
        buyer = User.objects.create_user(email='buyer@example.com', name='Buyer', password='pw')
        start = timezone.now() + timezone.timedelta(days=1)
        end = start + timezone.timedelta(hours=2)
        ev = Event.objects.create(title='Public Event', description='ok', organization='Org', category='General', start_time=start, end_time=end, is_approved=True)

        # unauthenticated buy should be 401
        resp = self.client.post(f'/api/events/{ev.id}/buy/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        token = self._make_token(buyer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.post(f'/api/events/{ev.id}/buy/')
        self.assertIn(resp.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))
        self.assertIn('ticket_id', resp.data)

        # second purchase is idempotent
        resp2 = self.client.post(f'/api/events/{ev.id}/buy/')
        self.assertIn(resp2.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))
        self.assertIn('detail', resp2.data)

    def test_get_ticket_for_event_and_cancel(self):
        u = User.objects.create_user(email='u1@example.com', name='U1', password='pw')
        start = timezone.now() + timezone.timedelta(days=1)
        end = start + timezone.timedelta(hours=2)
        ev = Event.objects.create(title='E1', description='', organization='Org', category='Gen', start_time=start, end_time=end, is_approved=True)

        token = self._make_token(u)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # initially no ticket
        resp = self.client.get(f'/api/events/{ev.id}/ticket/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

        # buy ticket then get
        buy = self.client.post(f'/api/events/{ev.id}/buy/')
        self.assertIn(buy.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))
        resp = self.client.get(f'/api/events/{ev.id}/ticket/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # cancel
        cancel = self.client.post(f'/api/events/{ev.id}/cancel/')
        self.assertEqual(cancel.status_code, status.HTTP_200_OK)

    def test_checkin_ticket_permissions(self):
        # create event owner and attendee
        owner = User.objects.create_user(email='owner@example.com', name='Owner', password='pw')
        attendee = User.objects.create_user(email='att@example.com', name='Att', password='pw')
        start = timezone.now() - timezone.timedelta(days=1)
        end = start + timezone.timedelta(hours=2)
        ev = Event.objects.create(title='Past', description='', organization='Org', category='G', start_time=start, end_time=end, is_approved=True, organizer=owner)

        # attendee buys a ticket
        token_att = self._make_token(attendee)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_att}')
        buy = self.client.post(f'/api/events/{ev.id}/buy/')
        self.assertIn(buy.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))
        ticket_id = buy.data.get('ticket_id')

        # another random user cannot check in
        other = User.objects.create_user(email='other@example.com', name='Other', password='pw')
        token_other = self._make_token(other)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_other}')
        chk = self.client.post(f'/api/tickets/{ticket_id}/checkin/')
        self.assertIn(chk.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED))

        # owner can check in
        token_owner = self._make_token(owner)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_owner}')
        chk2 = self.client.post(f'/api/tickets/{ticket_id}/checkin/')
        self.assertEqual(chk2.status_code, status.HTTP_200_OK)

    def test_venue_list_public_and_analytics_permissions(self):
        v = Venue.objects.create(name='V1', address='Addr', capacity=100)
        resp = self.client.get('/api/venues/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        names = [x.get('name') for x in resp.data]
        self.assertIn('V1', names)

        # analytics requires owner/admin
        owner = User.objects.create_user(email='owner2@example.com', name='Owner2', password='pw')
        start = timezone.now() + timezone.timedelta(days=1)
        end = start + timezone.timedelta(hours=2)
        ev = Event.objects.create(title='AnalyticsEvent', description='', organization='Org', category='G', start_time=start, end_time=end, is_approved=True, organizer=owner)

        # unauthenticated -> 403 on analytics
        resp = self.client.get(f'/api/events/{ev.id}/analytics/')
        self.assertIn(resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED))

        token = self._make_token(owner)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp2 = self.client.get(f'/api/events/{ev.id}/analytics/')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)

    def test_approve_and_reject_organizer_requires_admin(self):
        # create a pending organizer
        pending = User.objects.create_user(email='pend@example.com', name='Pending', password='pw')
        pending.role = 'organizer'
        pending.status = 'pending'
        pending.save()

        # non-admin cannot approve
        nonadmin = User.objects.create_user(email='na@example.com', name='NA', password='pw')
        token = self._make_token(nonadmin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.post(f'/api/users/{pending.id}/approve_organizer/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # admin can approve and reject
        admin = User.objects.create_superuser(email='admin@example.com', name='Admin', password='pw')
        token_admin = self._make_token(admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_admin}')
        resp2 = self.client.post(f'/api/users/{pending.id}/approve_organizer/')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)

        # set another pending and reject
        pending2 = User.objects.create_user(email='pend2@example.com', name='Pending2', password='pw')
        pending2.role = 'organizer'
        pending2.status = 'pending'
        pending2.save()
        resp3 = self.client.post(f'/api/users/{pending2.id}/reject_organizer/')
        self.assertEqual(resp3.status_code, status.HTTP_200_OK)

    def test_buy_unapproved_event_forbidden(self):
        buyer = User.objects.create_user(email='buyer2@example.com', name='Buyer2', password='pw')
        start = timezone.now() + timezone.timedelta(days=2)
        end = start + timezone.timedelta(hours=2)
        ev = Event.objects.create(title='Closed', description='', organization='Org', category='G', start_time=start, end_time=end, is_approved=False)

        token = self._make_token(buyer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = self.client.post(f'/api/events/{ev.id}/buy/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_attendees_and_export_permissions(self):
        owner = User.objects.create_user(email='own3@example.com', name='Owner3', password='pw')
        attendee = User.objects.create_user(email='att3@example.com', name='Att3', password='pw')
        start = timezone.now() + timezone.timedelta(days=1)
        end = start + timezone.timedelta(hours=2)
        ev = Event.objects.create(title='WithAtt', description='', organization='Org', category='G', start_time=start, end_time=end, is_approved=True, organizer=owner)

        # attendee buys ticket
        token_att = self._make_token(attendee)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_att}')
        buy = self.client.post(f'/api/events/{ev.id}/buy/')
        self.assertIn(buy.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))

        # another authenticated non-owner should get 403 for attendees
        other = User.objects.create_user(email='other2@example.com', name='Other2', password='pw')
        token_other = self._make_token(other)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_other}')
        resp = self.client.get(f'/api/events/{ev.id}/attendees/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # owner can access attendees and export
        token_owner = self._make_token(owner)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token_owner}')
        resp2 = self.client.get(f'/api/events/{ev.id}/attendees/')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        resp3 = self.client.get(f'/api/events/{ev.id}/attendees/export/')
        self.assertEqual(resp3.status_code, status.HTTP_200_OK)
