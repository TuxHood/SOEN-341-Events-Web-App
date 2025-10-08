import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'

// ...existing code...
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import OrganizerDashboard from './pages/OrganizerDashboard'

function App() {
  return (
    <BrowserRouter>
      <nav style={{padding:10, borderBottom:'1px solid #ddd', textAlign:'center'}}>
        <Link to="/" style={{margin:'0 12px'}}>Home</Link>
        <Link to="/organizer" style={{margin:'0 12px'}}>Organizer</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
