# Event Analytics Dashboard Feature

## Overview
The Event Analytics Dashboard provides real-time insights into event performance, including ticket distribution, attendance tracking, and venue capacity utilization.

## Backend Implementation

### API Endpoint
**URL:** `/api/events/{event_id}/analytics/`  
**Method:** `GET`  
**Authentication:** Required (organizer access)

### Response Format
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

### Metrics Explained

1. **Tickets Issued**: Total number of tickets generated for the event
2. **Tickets Checked In**: Number of attendees who have arrived (is_used=True)
3. **Tickets Pending**: Issued tickets not yet checked in
4. **Venue Capacity**: Maximum capacity of the venue
5. **Remaining Capacity**: Available spots (capacity - tickets_issued)
6. **Check-in Percentage**: (checked_in / tickets_issued) × 100
7. **Capacity Utilization**: (tickets_issued / venue_capacity) × 100

## Frontend Implementation

### Component Location
`frontend/src/pages/EventAnalyticsDashboard.jsx`

### Features

#### 1. Key Metrics Cards
- Four main metric cards with color-coded borders:
  - **Tickets Issued** (Blue): Total tickets distributed
  - **Checked In** (Green): Current attendance count
  - **Pending Check-in** (Yellow): Tickets awaiting check-in
  - **Venue Capacity** (Purple): Total venue capacity with remaining spots

#### 2. Progress Bars
- **Check-in Progress**: Visual representation of attendance rate
- **Capacity Utilization**: Shows how full the venue is
  - Red (>90%): Near capacity
  - Yellow (70-90%): Moderately full
  - Blue (<70%): Plenty of space

#### 3. Summary Table
Detailed breakdown of all analytics metrics in a clean table format.

#### 4. Auto-refresh
Manual refresh button to update analytics in real-time.

## Usage

### For Organizers
1. Navigate to your event
2. Click "View Analytics" button
3. Monitor real-time attendance and capacity
4. Make informed decisions about:
   - Whether to issue more tickets
   - When to close ticket sales
   - Capacity management

### For Attendees
This dashboard is typically restricted to event organizers only.

## Integration Steps

### 1. Backend Setup
The analytics endpoint is already integrated into the EventViewSet:
```python
# In event_management/views.py
@action(detail=True, methods=['get'], url_path='analytics')
def analytics(self, request, pk=None):
    # Analytics logic
```

### 2. Frontend Routing
Add the route to your React Router configuration:
```javascript
import EventAnalyticsDashboard from './pages/EventAnalyticsDashboard';

// In your routes
<Route path="/events/:eventId/analytics" element={<EventAnalyticsDashboard />} />
```

### 3. Link from Event Detail Page
Add a button in your Event Detail page:
```javascript
import { Link } from 'react-router-dom';

<Link to={`/events/${event.id}/analytics`}>
  <button className="btn-primary">View Analytics</button>
</Link>
```

## Database Schema

### Event Model
- `venue`: ForeignKey to Venue (provides capacity)

### Venue Model
- `capacity`: PositiveIntegerField (max attendees)

### Ticket Model
- `event`: ForeignKey to Event
- `is_used`: BooleanField (tracks check-in status)

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live updates
2. **Historical Data**: Track analytics over time
3. **Comparison Charts**: Compare multiple events
4. **Export Functionality**: Download analytics as PDF/CSV
5. **Predictive Analytics**: ML-based attendance predictions
6. **Demographic Breakdowns**: Analyze attendee demographics
7. **Revenue Tracking**: If tickets are paid, show revenue metrics

## Testing

### Backend Test
```python
# Test the analytics endpoint
response = client.get(f'/api/events/{event_id}/analytics/')
assert response.status_code == 200
assert 'tickets_issued' in response.data
```

### Frontend Test
```javascript
// Test component rendering
render(<EventAnalyticsDashboard />);
expect(screen.getByText('Event Analytics Dashboard')).toBeInTheDocument();
```

## API Configuration

Make sure your frontend API config points to the correct backend:
```javascript
// src/api/config.js
export const API_BASE_URL = 'http://localhost:8000/api';
```

## Security Considerations

1. **Authentication**: Ensure only organizers can access their event analytics
2. **Rate Limiting**: Prevent excessive API calls
3. **Data Privacy**: Don't expose personal attendee information

## Color Scheme

- **Blue (#3B82F6)**: Tickets issued
- **Green (#10B981)**: Success/checked-in
- **Yellow (#F59E0B)**: Pending/warning
- **Purple (#8B5CF6)**: Capacity
- **Red (#EF4444)**: Over capacity warning

## Responsive Design

The dashboard is fully responsive:
- **Mobile**: Stacked single-column layout
- **Tablet**: 2-column grid
- **Desktop**: 4-column grid for metrics

---

**Created by:** TuxHood  
**Date:** October 24, 2025  
**Version:** 1.0
