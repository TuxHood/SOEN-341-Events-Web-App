import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockEvents = [
      { id: 1, title: 'Spring Concert 2025', tickets: 150, checked_in: 120, date: 'March 15, 2025' },
      { id: 2, title: 'Tech Workshop', tickets: 50, checked_in: 35, date: 'March 20, 2025' },
      { id: 3, title: 'Sports Tournament', tickets: 200, checked_in: 200, date: 'March 25, 2025' },
    ];
    
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <h2 style={{ color: '#6b7280' }}>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e5e7eb',
        padding: '40px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: '700', 
            marginBottom: '8px',
            color: '#111827'
          }}>
            Organizer Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Manage your events and track attendance
          </p>
        </div>
      </div>

      {/* Events */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gap: '24px' }}>
          {events.map(event => {
            const rate = event.tickets > 0 ? Math.round((event.checked_in / event.tickets) * 100) : 0;
            
            return (
              <div
                key={event.id}
                style={{
                  background: '#fff',
                  padding: '32px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>
                      {event.title}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                      {event.date}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>
                          Tickets Issued
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                          {event.tickets}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>
                          Checked In
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                          {event.checked_in}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>
                          Rate
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                          {rate}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', minWidth: '200px' }}>
                    <Link to={`/events/${event.id}/analytics`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-outline" style={{ width: '100%', padding: '12px 24px', fontSize: '15px' }}>
                        View Analytics
                      </button>
                    </Link>
                    
                    <Link to={`/events/${event.id}/attendees`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-primary" style={{ width: '100%', padding: '12px 24px', fontSize: '15px' }}>
                        View Attendee List
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#111827', textDecoration: 'none', fontWeight: '600' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}