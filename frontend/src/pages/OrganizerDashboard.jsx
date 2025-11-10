import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/apiClient';
import { useAuth } from '../components/AuthProvider';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, ready } = useAuth();
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', start_time: '', end_time: '', organization: '', category: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Request organizer-only events. Backend supports ?organizer=me
        const res = await api.get('/events/', { params: { organizer: 'me' } });
        if (!cancelled) {
          setEvents(res.data || []);
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail || e.message || 'Failed to load events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Wait for AuthProvider to rehydrate so organizer=me is meaningful
    if (ready) load();
    return () => { cancelled = true; };
  }, [ready]);

  async function handleCreate(ev) {
    ev.preventDefault();
    setCreating(true);
    setError(null);
    try {
      // minimal payload
      const payload = {
        title: newEvent.title,
        description: newEvent.description,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        organization: newEvent.organization || 'Organizer',
        category: newEvent.category || 'General'
      };
      await api.post('/events/', payload);
      // reload events
      const res = await api.get('/events/', { params: { organizer: 'me' } });
      setEvents(res.data || []);
      // reset form
      setNewEvent({ title: '', description: '', start_time: '', end_time: '', organization: '', category: '' });
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  }

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

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h3 style={{ color: '#ef4444' }}>Error</h3>
          <div style={{ color: '#6b7280' }}>{error}</div>
        </div>
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
      {/* Create event form */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, marginBottom: '12px', fontSize: '1.25rem' }}>Create a new event</h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input required placeholder="Title" value={newEvent.title} onChange={e => setNewEvent(s => ({ ...s, title: e.target.value }))} className="p-2 border rounded" />
            <input required placeholder="Organization" value={newEvent.organization} onChange={e => setNewEvent(s => ({ ...s, organization: e.target.value }))} className="p-2 border rounded" />
            <input required type="datetime-local" placeholder="Starts" value={newEvent.start_time} onChange={e => setNewEvent(s => ({ ...s, start_time: e.target.value }))} className="p-2 border rounded" />
            <input required type="datetime-local" placeholder="Ends" value={newEvent.end_time} onChange={e => setNewEvent(s => ({ ...s, end_time: e.target.value }))} className="p-2 border rounded" />
            <input placeholder="Category" value={newEvent.category} onChange={e => setNewEvent(s => ({ ...s, category: e.target.value }))} className="p-2 border rounded" />
            <input placeholder="(Optional) Short description" value={newEvent.description} onChange={e => setNewEvent(s => ({ ...s, description: e.target.value }))} className="p-2 border rounded" />
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="submit" disabled={creating} className="rounded px-3 py-1 text-white" style={{ background: '#000' }}>{creating ? 'Creating…' : 'Create Event'}</button>
            </div>
          </form>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gap: '24px' }}>
          {events.map(event => {
            // Ownership guard: show edit/analytics/attendees only if current user is organizer or admin
            const isOwner = (user && (user.role === 'admin' || user.id === event.organizer));
            const displayDate = event.start_time ? new Date(event.start_time).toLocaleString() : '';

            return (
              <div key={event.id} style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>{event.title}</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '6px' }}>{displayDate}</p>
                    {/* approval status */}
                    {typeof event.is_approved !== 'undefined' && (
                      <div style={{ marginBottom: '14px' }}>
                        {event.is_approved ? (
                          <span style={{ color: '#065f46', background: '#ecfdf5', padding: '4px 8px', borderRadius: 6, fontSize: '13px', fontWeight: 600 }}>Approved</span>
                        ) : (
                          <span style={{ color: '#92400e', background: '#fff7ed', padding: '4px 8px', borderRadius: 6, fontSize: '13px', fontWeight: 600 }}>Pending approval</span>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Tickets Issued</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{event.tickets_issued ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Checked In</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{event.tickets_checked_in ?? '—'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', minWidth: '200px' }}>
                    {isOwner ? (
                      <Link to={`/events/${event.id}/analytics`} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-outline" style={{ width: '100%', padding: '12px 24px', fontSize: '15px' }}>View Analytics</button>
                      </Link>
                    ) : (
                      <button disabled className="btn btn-outline" style={{ width: '100%', padding: '12px 24px', fontSize: '15px', opacity: 0.6 }}>Analytics (owner only)</button>
                    )}

                    {isOwner ? (
                      <Link to={`/events/${event.id}/edit`} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-outline" style={{ width: '100%', padding: '12px 24px', fontSize: '15px' }}>Edit Event</button>
                      </Link>
                    ) : (
                      <button disabled className="btn btn-outline" style={{ width: '100%', padding: '12px 24px', fontSize: '15px', opacity: 0.6 }}>Edit (owner only)</button>
                    )}

                    {isOwner ? (
                      <Link to={`/events/${event.id}/attendees`} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '12px 24px', fontSize: '15px', background: '#000', color: '#fff', border: 'none' }}>View Attendee List</button>
                      </Link>
                    ) : (
                      <button disabled className="btn btn-primary" style={{ width: '100%', padding: '12px 24px', fontSize: '15px', opacity: 0.6 }}>Attendees (owner only)</button>
                    )}
                    {isOwner ? (
                      <Link to={`/events/${event.id}/scan`} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-outline" style={{ width: '100%', padding: '12px 24px', fontSize: '15px' }}>Open Scanner</button>
                      </Link>
                    ) : (
                      <button disabled className="btn btn-outline" style={{ width: '100%', padding: '12px 24px', fontSize: '15px', opacity: 0.6 }}>Scanner (owner only)</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link to="/events" style={{ color: '#111827', textDecoration: 'none', fontWeight: '600' }}>
            ← Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}