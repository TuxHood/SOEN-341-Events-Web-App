import React from 'react'
import { Link } from 'react-router-dom'

export default function OrganizerDashboard() {
  return (
    <div style={{padding:20}}>
      <h2>Organizer Dashboard</h2>
      <p>Quick analytics and tools (prototype).</p>
      <ul>
        <li>Tickets issued: 42</li>
        <li>Attendance rate: 76%</li>
        <li>Remaining capacity: 58</li>
      </ul>
      <p><Link to="/">Back to Home</Link></p>
    </div>
  )
}
