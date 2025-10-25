# Sample Data for Event Analytics Dashboard

## 🔑 Login Credentials

**IMPORTANT - Save these credentials for testing:**

- **Organizer**: `organizer@example.com` / `testpass123`
- **Attendees**: `attendee1@example.com` through `attendee5@example.com` / `testpass123`

## Overview
This document explains the sample data that has been created for testing the Event Analytics Dashboard.

## What Was Created

### 5 Events
1. **Spring Concert 2025** (ID: 1)
   - Venue: Main Auditorium (200 capacity)
   - Tickets Issued: 150
   - Checked In: 120 (80%)
   - Category: Concert

2. **Python Workshop** (ID: 2)
   - Venue: Student Center (150 capacity)
   - Tickets Issued: 100
   - Checked In: 85 (85%)
   - Category: Workshop

3. **Tech Conference 2025** (ID: 3)
   - Venue: Sports Complex (300 capacity)
   - Tickets Issued: 250
   - Checked In: 180 (72%)
   - Category: Conference

4. **Basketball Tournament** (ID: 4)
   - Venue: Sports Complex (300 capacity)
   - Tickets Issued: 200
   - Checked In: 200 (100%)
   - Category: Sports

5. **Networking Night** (ID: 5)
   - Venue: Student Center (150 capacity)
   - Tickets Issued: 80
   - Checked In: 45 (56.25%)
   - Category: Social

### Users
- **Organizer**: organizer@example.com / testpass123
- **Attendees**: attendee1@example.com through attendee5@example.com / testpass123

### Venues
- Main Auditorium (200 capacity)
- Student Center (150 capacity)
- Sports Complex (300 capacity)

### Categories
- Concert
- Workshop
- Conference
- Sports
- Social

## How to Recreate Sample Data

If you need to recreate the sample data:

```bash
cd backend/collegeEventsWeb
python manage.py create_sample_data
```

## Testing the Analytics Dashboard

### View Analytics for Each Event
- Event 1: http://localhost:5173/events/1/analytics
- Event 2: http://localhost:5173/events/2/analytics
- Event 3: http://localhost:5173/events/3/analytics
- Event 4: http://localhost:5173/events/4/analytics
- Event 5: http://localhost:5173/events/5/analytics

### API Endpoints
- List all events: http://localhost:8000/api/events/
- Event 1 details: http://localhost:8000/api/events/1/
- Event 1 analytics: http://localhost:8000/api/events/1/analytics/

## Test Scenarios

### Scenario 1: High Attendance (Event 1 - Spring Concert)
- 80% check-in rate
- 75% capacity utilization
- Good turnout, room for more tickets

### Scenario 2: Full House (Event 4 - Basketball Tournament)
- 100% check-in rate
- 66.7% capacity utilization
- All tickets used, still has venue capacity

### Scenario 3: Lower Attendance (Event 5 - Networking Night)
- 56.25% check-in rate
- 53.3% capacity utilization
- Many no-shows, plenty of space

### Scenario 4: Near Capacity (Event 3 - Tech Conference)
- 72% check-in rate
- 83.3% capacity utilization
- Getting full, limited tickets available

## Cleaning Up

To remove all sample data:

```bash
cd backend/collegeEventsWeb
python manage.py flush
```

Then recreate with:
```bash
python manage.py migrate
python manage.py create_sample_data
```

## Notes

- All events are set to occur in the future (3-45 days from now)
- Tickets are distributed among the 5 test attendees
- Check-in status varies to demonstrate different analytics scenarios
- All passwords are set to `testpass123` for easy testing

---

**Created**: October 24, 2025  
**Command**: `python manage.py create_sample_data`
