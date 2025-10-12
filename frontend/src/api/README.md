# API Configuration

This folder contains the API endpoint configuration for the frontend.

## For Backend teammates

When you create the backend endpoints, update `config.js` with the correct URLs:

### Current Endpoints (Need to be implemented):
```javascript
{
  register: '/api/users/register/',  // POST - Create new user account
  login: '/api/users/login/',        // POST - User login
  events: '/api/events/',            // GET - List all events
  tickets: '/api/tickets/',          // GET/POST - Ticket operations
}