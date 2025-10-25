# Event Analytics Dashboard - Quick Start Guide

## � Login Credentials for Testing

**SAVE THESE:**
- **Organizer**: `organizer@example.com` / `testpass123`
- **Attendee**: `attendee1@example.com` / `testpass123`

*(Created by running: `python manage.py create_sample_data`)*

---

## �🚀 Quick Implementation

### Backend (Already Done ✅)

The analytics endpoint has been added to `event_management/views.py`:
- URL: `/api/events/{event_id}/analytics/`
- Method: GET
- Returns: Event analytics data

### Frontend (Already Done ✅)

1. **Component Created**: `frontend/src/pages/EventAnalyticsDashboard.jsx`
2. **API Service Created**: `frontend/src/api/analytics.js`

## 📋 Integration Checklist

### Step 1: Add Route to Your Router
In your main router file (e.g., `App.jsx` or routes configuration):

```javascript
import EventAnalyticsDashboard from './pages/EventAnalyticsDashboard';

// Add this route
<Route path="/events/:eventId/analytics" element={<EventAnalyticsDashboard />} />
```

### Step 2: Add Link from Event Detail Page
In your Event Detail component, add a button to view analytics:

```javascript
import { Link, useParams } from 'react-router-dom';

function EventDetail() {
  const { eventId } = useParams();
  
  return (
    <div>
      {/* ...existing event details... */}
      
      <Link to={`/events/${eventId}/analytics`}>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          📊 View Analytics
        </button>
      </Link>
    </div>
  );
}
```

### Step 3: Test the Endpoint

#### Backend Test:
```bash
# Start your backend server
./scripts/start-backend.cmd

# In another terminal, test the endpoint
curl http://localhost:8000/api/events/1/analytics/
```

#### Expected Response:
```json
{
  "event_id": 1,
  "event_title": "Spring Concert 2025",
  "tickets_issued": 150,
  "tickets_checked_in": 120,
  "tickets_pending": 30,
  "venue_capacity": 200,
  "remaining_capacity": 50,
  "check_in_percentage": 80.0,
  "capacity_utilization": 75.0
}
```

## 🎨 Dashboard Features

### Metrics Displayed:
1. **Tickets Issued** - Total tickets created for the event
2. **Checked In** - Number of attendees who have arrived
3. **Pending Check-in** - Tickets not yet scanned
4. **Venue Capacity** - Maximum capacity with remaining spots

### Visual Elements:
- Color-coded metric cards
- Progress bars for check-in rate and capacity
- Detailed summary table
- Responsive design (mobile, tablet, desktop)

## 🔧 Customization Options

### Change Colors:
Edit the Tailwind classes in `EventAnalyticsDashboard.jsx`:
```javascript
// Current: border-blue-500
// Change to: border-indigo-500 (or any color)
```

### Add More Metrics:
In `event_management/views.py`, add to `analytics_data`:
```python
analytics_data = {
    # ...existing fields...
    'revenue': calculate_revenue(),  # Your custom metric
}
```

### Add Charts:
Install a charting library:
```bash
npm install recharts
```

Then import and use in the component:
```javascript
import { PieChart, Pie, Cell } from 'recharts';
```

## 📊 Sample Data for Testing

Create test data in Django admin or shell:

```python
# In Django shell (python manage.py shell)
from event_management.models import Event, Venue
from ticket_services.models import Ticket
from user_accounts.models import User

# Create venue
venue = Venue.objects.create(name="Main Hall", address="123 Campus St", capacity=200)

# Create event
organizer = User.objects.first()
event = Event.objects.create(
    title="Test Event",
    description="Analytics test",
    venue=venue,
    organizer=organizer,
    start_time="2025-11-01 18:00",
    end_time="2025-11-01 22:00"
)

# Create tickets
user = User.objects.first()
for i in range(150):
    Ticket.objects.create(event=event, owner=user)

# Mark some as checked in
Ticket.objects.filter(event=event)[:120].update(is_used=True)
```

## 🐛 Troubleshooting

### Issue: 404 on analytics endpoint
**Solution**: Make sure your Django server is running and the event_management app is in INSTALLED_APPS

### Issue: CORS errors
**Solution**: Add to `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
]
```

### Issue: Analytics showing 0 for everything
**Solution**: Create test tickets using the Django admin or shell (see Sample Data above)

### Issue: Component not rendering
**Solution**: Check that react-router-dom is installed:
```bash
cd frontend
npm install react-router-dom
```

## 🎯 Next Steps

1. ✅ Test the backend endpoint with sample data
2. ✅ Add the route to your router
3. ✅ Link from event detail page
4. ✅ Style to match your app's theme
5. 🔄 Add real-time updates (optional)
6. 🔄 Add export to PDF/CSV (optional)
7. 🔄 Add charts and graphs (optional)

## 📞 Support

For questions or issues:
- Check FEATURE_EVENT_ANALYTICS.md for detailed documentation
- Review the code comments in EventAnalyticsDashboard.jsx
- Test the API endpoint directly with curl/Postman

---

**Ready to use!** The feature is fully functional and just needs to be integrated into your routing. 🎉
