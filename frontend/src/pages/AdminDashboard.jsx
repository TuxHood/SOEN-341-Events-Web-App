import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div style={{padding:20}}>
      <h2>Admin Dashboard</h2>
      <p>Platform overview and moderation tools (prototype).</p>
      <ul>
        <li>Total Events: 127</li>
        <li>Total Attendance: 3,456</li>
        <li>Pending Approvals: 8</li>
        <li>Active Organizations: 23</li>
      </ul>
      <p><Link to="/">Back to Home</Link></p>
    </div>
  )
}