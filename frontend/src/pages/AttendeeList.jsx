import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function AttendeeList() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [attendeeData, setAttendeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/events/${eventId}/attendees/`, {
        credentials: 'include',
      });
      
      if (response.status === 401 || response.status === 403) {
        navigate('/auth/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendees');
      }
      
      const data = await response.json();
      setAttendeeData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`http://127.0.0.1:8000/api/events/${eventId}/attendees/export/`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <h2 style={{ color: '#6b7280' }}>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '60px 40px', textAlign: 'center' }}>
        <h2 style={{ color: '#DC2626', marginBottom: '20px' }}>Error: {error}</h2>
        <Link to="/organizer" style={{ color: '#111827', textDecoration: 'none', fontWeight: '600' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!attendeeData) {
    return null;
  }

  const checkedInPercentage = attendeeData.total_attendees > 0 
    ? Math.round((attendeeData.checked_in_count / attendeeData.total_attendees) * 100) 
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/organizer" style={{ color: '#111827', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ marginTop: '16px', fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
            Attendee Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', marginTop: '8px' }}>
            {attendeeData.event_title}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
              Total Tickets Issued
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#111827' }}>
              {attendeeData.total_attendees}
            </div>
          </div>

          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
              Checked In
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#059669' }}>
              {attendeeData.checked_in_count}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              {checkedInPercentage}% of total
            </div>
          </div>

          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
              Pending Check-in
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#d97706' }}>
              {attendeeData.total_attendees - attendeeData.checked_in_count}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div style={{ 
          marginBottom: '24px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
            Attendee List
          </h2>
          <button
            onClick={handleExportCSV}
            style={{
              background: '#111827',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#1f2937';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#111827';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            Export to CSV
          </button>
        </div>

        {/* Attendees Table */}
        {attendeeData.attendees && attendeeData.attendees.length > 0 ? (
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Name
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Email
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Ticket ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendeeData.attendees.map((attendee, index) => (
                  <tr 
                    key={attendee.ticket_id}
                    style={{ 
                      borderBottom: index < attendeeData.attendees.length - 1 ? '1px solid #e5e7eb' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px', fontWeight: '500', color: '#111827' }}>
                      {attendee.name}
                    </td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>
                      {attendee.email}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: attendee.is_checked_in ? '#d1fae5' : '#fef3c7',
                        color: attendee.is_checked_in ? '#065f46' : '#92400e'
                      }}>
                        {attendee.is_checked_in ? 'Checked In' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '13px', fontFamily: 'monospace' }}>
                      {attendee.ticket_id.slice(0, 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            background: '#fff', 
            padding: '60px 40px', 
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              No attendees yet for this event.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}