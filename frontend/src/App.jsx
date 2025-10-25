import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'

// Import pages
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import OrganizerDashboard from './pages/OrganizerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import EventDiscovery from './pages/EventDiscovery'
import EventAnalyticsDashboard from './pages/EventAnalyticsDashboard'

function App() {
  return (
    <BrowserRouter>
      <nav style={{padding:10, borderBottom:'1px solid #ddd', textAlign:'center'}}>
        <Link to="/" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Home</Link>
        <Link to="/organizer" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Organizer</Link>
        <Link to="/events/1/analytics" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>📊 Analytics</Link>
        <Link to="/auth/login" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/events/:eventId/analytics" element={<EventAnalyticsDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/events" element={<EventDiscovery />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App