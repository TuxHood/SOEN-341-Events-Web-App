import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function EventDetail() {
  const { id } = useParams()
  return (
    <div style={{padding:20}}>
      <h2>Event Detail — #{id}</h2>
      <p>Details for event {id}. (Prototype data)</p>
      <button>Claim Ticket</button>
      <p><Link to="/">Back to Home</Link></p>
    </div>
  )
}
