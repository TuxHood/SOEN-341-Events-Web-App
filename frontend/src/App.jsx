// import React from 'react'
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
// import './App.css'

// // Import pages
// import Home from './pages/Home'
// import EventDetail from './pages/EventDetail'
// import OrganizerDashboard from './pages/OrganizerDashboard'
// import AdminDashboard from './pages/AdminDashboard'
// import LoginPage from './pages/LoginPage'
// import SignUpPage from './pages/SignUpPage'
// import EventDiscovery from './pages/EventDiscovery'
// import EventAnalyticsDashboard from './pages/EventAnalyticsDashboard'
// import AttendeeList from './pages/AttendeeList'

// function App() {
//   return (
//     <BrowserRouter>
//       <nav style={{padding:10, borderBottom:'1px solid #ddd', textAlign:'center'}}>
//         <Link to="/" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Home</Link>
//         <Link to="/organizer" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Organizer</Link>
//         <Link to="/events/1/analytics" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>📊 Analytics</Link>
//         <Link to="/auth/login" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Login</Link>
//       </nav>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/event/:id" element={<EventDetail />} />
//         <Route path="/events/:eventId/analytics" element={<EventAnalyticsDashboard />} />
//         <Route path="/organizer" element={<OrganizerDashboard />} />
//         <Route path="/admin" element={<AdminDashboard />} />
//         <Route path="/auth/login" element={<LoginPage />} />
//         <Route path="/auth/sign-up" element={<SignUpPage />} />
//         <Route path="/events" element={<EventDiscovery />} />
//         <Route path="/events/:eventId/attendees" element={<AttendeeList />} />
//       </Routes>
//     </BrowserRouter>
//   )
// }

// export default App

// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'

// Existing pages
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import OrganizerDashboard from './pages/OrganizerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import EventDiscovery from './pages/EventDiscovery'
import EventAnalyticsDashboard from './pages/EventAnalyticsDashboard'
import AttendeeList from './pages/AttendeeList'

// Student dashboard pages (NO GUARDS for now)
import StudentLayout from './pages/student/StudentLayout'
import Discover from './pages/student/Discover'
import MyEvents from './pages/student/MyEvents'
import Tickets from './pages/student/Tickets'
import CalendarView from './pages/student/CalendarView'
import Profile from './pages/student/Profile'

function App() {
  return (
    <BrowserRouter>
      <nav style={{padding:10, borderBottom:'1px solid #ddd', textAlign:'center'}}>
        <Link to="/" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Home</Link>
        <Link to="/organizer" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Organizer</Link>
        <Link to="/events/1/analytics" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>📊 Analytics</Link>
        <Link to="/auth/login" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Login</Link>
        <Link to="/student/discover" style={{margin:'0 12px', textDecoration:'none', color:'var(--foreground)', fontWeight:600}}>Student</Link>
      </nav>

      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/events/:eventId/analytics" element={<EventAnalyticsDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/events" element={<EventDiscovery />} />
        <Route path="/events/:eventId/attendees" element={<AttendeeList />} />

        {/* Student Dashboard (no guards) */}
        <Route path="/student" element={<StudentLayout />}>
          {/* /student -> /student/discover */}
          <Route index element={<Navigate to="discover" replace />} />
          <Route path="discover" element={<Discover />} />
          <Route path="myevents" element={<MyEvents />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback to student discover (optional) */}
        <Route path="*" element={<Navigate to="/student/discover" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
