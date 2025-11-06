import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CreateEventInline({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priceCents, setPriceCents] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title,
        organization,
        category,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
        image_url: imageUrl,
        price_cents: Number(priceCents) || 0,
      };

      // include Authorization header when available
      const { authHeaders } = await import('../api/auth.js');
      const headers = { 'Content-Type': 'application/json', ...(authHeaders ? authHeaders() : {}) };
      const res = await fetch('/api/events/', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || String(res.status));
      }

      setOpen(false);
      setTitle(''); setOrganization(''); setCategory(''); setStartTime(''); setEndTime(''); setImageUrl(''); setPriceCents(0);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>
        {open ? 'Close' : 'Create Event'}
      </button>
      {open && (
        <form onSubmit={submit} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          <input required placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
          <input placeholder="Organization" value={organization} onChange={e => setOrganization(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
          <input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
          <label style={{ fontSize: 12, color: '#6b7280' }}>Start</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
          <label style={{ fontSize: 12, color: '#6b7280' }}>End</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
          <input placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
          <input type="number" placeholder="Price (cents)" value={priceCents} onChange={e => setPriceCents(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }} />
          {error && <div style={{ color: '#DC2626' }}>{error}</div>}
          <button type="submit" disabled={submitting} style={{ padding: '10px 14px', borderRadius: 8, background: '#111827', color: '#fff', border: 'none' }}>{submitting ? 'Creating...' : 'Create Event'}</button>
        </form>
      )}
    </div>
  );
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        // include Authorization header when available so JWT-auth'd SPA requests are recognized
        let headers = {};
        try {
          const { authHeaders } = await import('../api/auth.js');
          headers = authHeaders ? authHeaders() : {};
        } catch (err) {
          // ignore - we'll still try with credentials only
          headers = {};
        }

        // fetch only organizer-owned events
        const evRes = await fetch(`/api/events/?organizer=me`, { credentials: 'include', headers });
        if (!evRes.ok) throw new Error(String(evRes.status));
        const evs = await evRes.json();

        // for each event, fetch analytics to get ticket counts
        const withCounts = await Promise.all(evs.map(async (e) => {
          try {
            const res = await fetch(`/api/events/${e.id}/analytics/`, { credentials: 'include', headers });
            if (!res.ok) return { ...e, tickets: 0, checked_in: 0 };
            const data = await res.json();
            return {
              ...e,
              tickets: data.tickets_issued ?? 0,
              checked_in: data.tickets_checked_in ?? 0,
              analytics: data,
            };
          } catch (err) {
            return { ...e, tickets: 0, checked_in: 0 };
          }
        }));

        if (mounted) {
          setEvents(withCounts);
        }
      } catch (err) {
        // If fetching events fails due to auth, redirect to login
        if (err.message && (err.message.includes('401') || err.message.includes('403'))) {
          navigate('/auth/login');
        }
        console.error('Failed to load events', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, [navigate]);

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
          {/* Create event quick form toggle */}
          <div style={{ marginTop: '16px' }}>
            <CreateEventInline onCreated={() => {
              // reload events after create
              setLoading(true);
              setTimeout(() => setLoading(false), 200); // slight UX flicker handled by reload in effect
              window.location.reload();
            }} />
          </div>
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
                      <button
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '12px 24px',
                          fontSize: '15px',
                          background: '#000',
                          color: '#fff',
                          border: 'none'
                        }}
                      >
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