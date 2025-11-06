import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function OrganizerRoute({ children }) {
  const ctx = useAuth();
  const location = useLocation();
  if (!ctx) return children ?? <Outlet />;

  const { user } = ctx;
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location }} />;

  // Only allow users with explicit role 'organizer'
  if (user.role !== 'organizer') {
    // Authenticated but not an organizer — show a simple unauthorized page
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f9fafb' }}>
        <div style={{ maxWidth: 720, background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 8 }}>Access denied</h2>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>You must be an organizer to view this page.</p>
          <a href="/" style={{ color: '#111827', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</a>
        </div>
      </div>
    );
  }

  return children ?? <Outlet />;
}
