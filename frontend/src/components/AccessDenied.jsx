import React from 'react'
import { Link } from 'react-router-dom'

export default function AccessDenied({ message, returnTo = '/events' }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', padding: '1.25rem 1.5rem', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight: 700, color: '#b91c1c', marginBottom: 6 }}>Access denied</div>
        {message ? (
          <div style={{ color: '#374151' }}>{message}</div>
        ) : (
          <Link
            to={returnTo}
            style={{
              display: 'inline-block',
              marginTop: 6,
              background: '#111827',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Return to events
          </Link>
        )}
      </div>
    </div>
  )
}
