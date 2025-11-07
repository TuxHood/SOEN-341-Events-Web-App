import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsAPI } from '../api/analytics';

const EventAnalyticsDashboard = () => {
  const { eventId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getEventAnalytics(eventId);
      if (!response.ok) {
        // Show a clear access-denied message for auth/permission failures
        if (response.status === 401 || response.status === 403) {
          const detail = response.data && (response.data.detail || response.data.error);
          setError(detail || 'Access Denied — must have organizer privileges');
          return;
        }

        // other errors: surface server message if present
        const msg = (response.data && (response.data.error || response.data.detail)) || 'Failed to fetch analytics';
        setError(msg);
        return;
      }

      setAnalytics(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(to right, #8B1538, #A91D3A)',
          color: 'white',
          padding: '2rem 1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Event Analytics</h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
          <div style={{ fontSize: '1.25rem', color: '#4B5563' }}>Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(to right, #8B1538, #A91D3A)',
          color: 'white',
          padding: '2rem 1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>Event Analytics</h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
          <div style={{ 
            background: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '2rem',
            maxWidth: '28rem'
          }}>
            <div style={{ color: '#DC2626', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>⚠️ Error</div>
            <div style={{ color: '#374151' }}>{error}</div>
            <button
              onClick={fetchAnalytics}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.5rem',
                background: '#8B1538',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#A91D3A'}
              onMouseOut={(e) => e.target.style.background = '#8B1538'}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header Section - Matching the maroon theme */}
      <div style={{ background: 'linear-gradient(to right, #8B1538, #A91D3A)', color: 'white', padding: '3rem 2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{analytics.event_title}</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Analytics Dashboard</p>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem' }}>
        {/* Key Metrics Cards - Event Card Style */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Tickets Issued */}
          <div style={{ borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
            <div style={{ padding: '1.5rem', color: 'white', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', opacity: 0.9 }}>Tickets Issued</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.tickets_issued}</div>
            </div>
          </div>

          {/* Checked In */}
          <div style={{ borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            <div style={{ padding: '1.5rem', color: 'white', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', opacity: 0.9 }}>Checked In</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.tickets_checked_in}</div>
              <div style={{ fontSize: '0.95rem', marginTop: '0.5rem', opacity: 0.9 }}>{analytics.check_in_percentage}% attendance</div>
            </div>
          </div>

          {/* Pending Check-in */}
          <div style={{ borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', background: 'linear-gradient(135deg, #F59E42, #D97706)' }}>
            <div style={{ padding: '1.5rem', color: 'white', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', opacity: 0.9 }}>Pending Check-in</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.tickets_pending}</div>
            </div>
          </div>

          {/* No-shows */}
          <div style={{ borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', background: 'linear-gradient(135deg, #F87171, #DC2626)' }}>
            <div style={{ padding: '1.5rem', color: 'white', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', opacity: 0.9 }}>No-shows</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.tickets_no_show || 0}</div>
            </div>
          </div>

          {/* Venue Capacity */}
          <div style={{ borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}>
            <div style={{ padding: '1.5rem', color: 'white', minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', opacity: 0.9 }}>Venue Capacity</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.venue_capacity}</div>
              <div style={{ fontSize: '0.95rem', marginTop: '0.5rem', opacity: 0.9 }}>{analytics.remaining_capacity} remaining</div>
            </div>
          </div>
        </div>

        {/* Progress Bars Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Check-in Progress */}
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '1.5rem' }}>Check-in Progress</h3>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#4B5563', fontWeight: 500 }}>Checked In vs Issued</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22C55E' }}>{analytics.check_in_percentage}%</span>
            </div>
            <div style={{ width: '100%', background: '#E5E7EB', borderRadius: '999px', height: '1.5rem', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(to right, #4ADE80, #16A34A)', height: '1.5rem', borderRadius: '999px', width: `${analytics.check_in_percentage}%`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.75rem', transition: 'width 0.5s' }}>
                {analytics.check_in_percentage > 10 && (
                  <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>{analytics.check_in_percentage}%</span>
                )}
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#4B5563' }}>
              <span style={{ fontWeight: 'bold', color: '#22C55E' }}>{analytics.tickets_checked_in}</span> of{' '}
              <span style={{ fontWeight: 'bold', color: '#374151' }}>{analytics.tickets_issued}</span> tickets checked in
            </div>
          </div>

          {/* Capacity Utilization */}
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '1.5rem' }}>Capacity Utilization</h3>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#4B5563', fontWeight: 500 }}>Tickets vs Capacity</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: analytics.capacity_utilization > 90 ? '#DC2626' : analytics.capacity_utilization > 70 ? '#F59E42' : '#2563EB' }}>{analytics.capacity_utilization}%</span>
            </div>
            <div style={{ width: '100%', background: '#E5E7EB', borderRadius: '999px', height: '1.5rem', overflow: 'hidden' }}>
              <div style={{
                height: '1.5rem',
                borderRadius: '999px',
                width: `${analytics.capacity_utilization}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '0.75rem',
                transition: 'width 0.5s',
                background: analytics.capacity_utilization > 90
                  ? 'linear-gradient(to right, #F87171, #DC2626)'
                  : analytics.capacity_utilization > 70
                  ? 'linear-gradient(to right, #FBBF24, #F59E42)'
                  : 'linear-gradient(to right, #60A5FA, #2563EB)'
              }}>
                {analytics.capacity_utilization > 10 && (
                  <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 'bold' }}>{analytics.capacity_utilization}%</span>
                )}
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#4B5563' }}>
              <span style={{ fontWeight: 'bold', color: '#2563EB' }}>{analytics.tickets_issued}</span> of{' '}
              <span style={{ fontWeight: 'bold', color: '#374151' }}>{analytics.venue_capacity}</span> capacity used
            </div>
          </div>
        </div>

        {/* Event Summary Table */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(to right, #8B1538, #A91D3A)', padding: '1.25rem 2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Event Summary</h3>
          </div>
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#4B5563', fontWeight: 500 }}>Total Tickets Issued</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{analytics.tickets_issued}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#4B5563', fontWeight: 500 }}>Tickets Checked In</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#22C55E' }}>{analytics.tickets_checked_in}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#4B5563', fontWeight: 500 }}>Pending Check-in</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#F59E42' }}>{analytics.tickets_pending}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#4B5563', fontWeight: 500 }}>No-shows</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#DC2626' }}>{analytics.tickets_no_show || 0}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#4B5563', fontWeight: 500 }}>Venue Capacity</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{analytics.venue_capacity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#4B5563', fontWeight: 500 }}>Remaining Capacity</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#A78BFA' }}>{analytics.remaining_capacity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#4B5563', fontWeight: 500 }}>Tickets Cancelled</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#9CA3AF' }}>{analytics.tickets_cancelled || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#4B5563', fontWeight: 500 }}>Check-in Rate</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#22C55E' }}>{analytics.check_in_percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={fetchAnalytics}
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(to right, #8B1538, #A91D3A)',
              color: 'white',
              fontSize: '1.15rem',
              fontWeight: 600,
              borderRadius: '1rem',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'background 0.3s, transform 0.2s',
            }}
            onMouseOver={e => e.target.style.background = 'linear-gradient(to right, #A91D3A, #8B1538)'}
            onMouseOut={e => e.target.style.background = 'linear-gradient(to right, #8B1538, #A91D3A)'}
          >
            🔄 Refresh Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventAnalyticsDashboard;
