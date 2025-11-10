import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function EventDetail() {
  const { eventId } = useParams()
  return (
    <div style={{padding:20}}>
      <h2>Event Detail — #{eventId}</h2>
      <p>Details for event {eventId}. (Prototype data)</p>
      <button>Claim Ticket</button>
      <p><Link to="/">Back to Home</Link></p>
    </div>
  )
}
