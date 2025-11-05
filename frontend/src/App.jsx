// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import EventDiscovery from "./pages/EventDiscovery";
import EventAnalyticsDashboard from "./pages/EventAnalyticsDashboard";
import AttendeeList from "./pages/AttendeeList";            // ← from main

import AuthProvider from "./components/AuthProvider";       // ← yours
import ProtectedRoute from "./components/ProtectedRoute";   // ← yours
import TicketConfirmation from "./pages/TicketConfirmation";
import BuyTicket from "./pages/BuyTicket";
import MyTickets from "./pages/MyTickets";
import TicketQR from "./pages/TicketQR";

function AppShell() {
  const { pathname } = useLocation();

  // Hide nav only on auth pages (show it everywhere else)
  const hideNav = ["/auth/login", "/auth/sign-up"];
  const showNav = !hideNav.includes(pathname);

  return (
    <>
      {showNav && (
        <nav style={{ padding: 10, borderBottom: "1px solid #ddd", textAlign: "center" }}>
          <Link to="/" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
            Home
          </Link>
          <Link to="/organizer" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
            Organizer
          </Link>
          <Link to="/events/1/analytics" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
            📊 Analytics
          </Link>
          <Link to="/auth/login" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
            Login
          </Link>
        </nav>
      )}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
  <Route path="/events/:eventId" element={<EventDetail />} />
  <Route path="/events/:eventId/analytics" element={<EventAnalyticsDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />

        {/* Your protected group */}
        <Route element={<ProtectedRoute />}>
          <Route path="/events" element={<EventDiscovery />} />
          <Route path="/me/tickets" element={<MyTickets />} />
          <Route path="/tickets/:tid/qr" element={<TicketQR />} />
        </Route>

        {/* Ticket flow (public after purchase link) */}
  <Route path="/events/:eventId/ticket" element={<TicketConfirmation />} />
  <Route path="/events/:eventId/buy" element={<BuyTicket />} />

        {/* From main (leave public unless you want to guard it) */}
  <Route path="/events/:eventId/attendees" element={<AttendeeList />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
