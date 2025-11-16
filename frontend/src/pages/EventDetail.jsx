import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'

export default function EventDetail() {
  const { eventId } = useParams()
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{padding:20}}>
      <h2>Event Detail — #{eventId}</h2>
      <p>Details for event {eventId}. (Prototype data)</p>

      {user ? (
        // Authenticated users can claim / buy tickets
        <>
          <button onClick={() => navigate(`/events/${eventId}/buy`)}>Claim / Buy Ticket</button>
        </>
      ) : (
        // Unauthenticated users: show clear Sign in / Sign up options
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/auth/login"><button>Sign in to register</button></Link>
          <Link to="/auth/sign-up"><button>Create account</button></Link>
        </div>
      )}

      <p style={{ marginTop: 16 }}><Link to="/">Back to Events</Link></p>
    </div>
  )
}
