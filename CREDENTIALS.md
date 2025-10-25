# Test Login Credentials

## 🔑 Sample Accounts

### Organizer Account
- **Email**: `organizer@example.com`
- **Password**: `testpass123`
- **Role**: Organizer
- **Access**: Can view analytics for all events

### Attendee Accounts
- **Email**: `attendee1@example.com` through `attendee5@example.com`
- **Password**: `testpass123` (same for all)
- **Role**: Student
- **Access**: Can view and book tickets

### Admin Account (Created separately)
- **Email**: `karmatuxhood@gmail.com`
- **Name**: Karma
- **Password**: (the one you set when creating superuser)
- **Role**: Admin
- **Access**: Full Django admin panel access at http://localhost:8000/admin/

## 📝 How These Were Created

These test accounts were created by running:
```bash
cd backend/collegeEventsWeb
python manage.py create_sample_data
```

## 🎯 Where to Use These

### Analytics Dashboard Testing
1. Go to: http://localhost:5173/events/1/analytics
2. Login with organizer account if prompted
3. View event analytics

### API Testing
```bash
# Login to get token
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@example.com","password":"testpass123"}'
```

### Django Admin
- URL: http://localhost:8000/admin/
- Use the superuser account (karmatuxhood@gmail.com)

## 🔄 Reset/Recreate Accounts

If you need to recreate these accounts:
```bash
cd backend/collegeEventsWeb
python manage.py flush  # WARNING: Deletes all data
python manage.py migrate
python manage.py create_sample_data
python manage.py createsuperuser  # Recreate admin
```

## 🎪 Sample Events Created

The `create_sample_data` command also creates:
- **5 Events** (Spring Concert, Python Workshop, etc.)
- **3 Venues** (Main Auditorium, Student Center, Sports Complex)
- **780 Tickets** distributed across events
- **5 Categories** (Concert, Workshop, Conference, Sports, Social)

## 📍 Quick Links

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **Analytics Dashboard**: http://localhost:5173/events/1/analytics

---

**Last Updated**: October 24, 2025  
**Created By**: Karma  
**Purpose**: Development and testing

⚠️ **DO NOT USE THESE CREDENTIALS IN PRODUCTION!**
