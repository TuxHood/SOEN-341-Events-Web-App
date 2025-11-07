import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useAuth } from "./components/AuthProvider";
import "./App.css";

import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import EventDiscovery from "./pages/EventDiscovery";
import EventAnalyticsDashboard from "./pages/EventAnalyticsDashboard";
import OrganizerApproval from "./pages/OrganizerApproval";
import AdminApprovals from "./pages/AdminApprovals";
import AttendeeList from "./pages/AttendeeList";

import AuthProvider from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import OrganizerRoute from "./components/OrganizerRoute";
import AdminRoute from "./components/AdminRoute";
import TicketConfirmation from "./pages/TicketConfirmation";
import BuyTicket from "./pages/BuyTicket";
import MyTickets from "./pages/MyTickets";
import TicketQR from "./pages/TicketQR";
import TicketScanner from "./pages/TicketScanner";
import EventScanner from "./pages/EventScanner";
import EventEdit from "./pages/EventEdit";

function AppShell() {
  const { pathname } = useLocation();
  const { user, ready } = useAuth();

  const isAdmin = Boolean(user && (user.role === 'admin' || user.is_staff));
  const isOrganizer = Boolean(user && (user.role === 'organizer' || isAdmin));

  // Hide nav on auth pages
  const hideNav = ["/auth/login", "/auth/sign-up"];
  const showNav = !hideNav.includes(pathname);

  return (
    <>
      {showNav && (
        <nav style={{ padding: 10, borderBottom: "1px solid #ddd", textAlign: "center" }}>
          <Link to="/" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
            Home
          </Link>
          {isOrganizer && (
            <Link to="/organizer" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
              Organizer
            </Link>
          )}
          {/* Show admin-only links only to admins/staff */}
          {isAdmin && (
            <>
              <Link to="/admin/organizer-approval" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
                Organizer Approval
              </Link>
              <Link to="/events/1/analytics" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
                📊 Analytics
              </Link>
            </>
          )}
          <Link to="/auth/login" style={{ margin: "0 12px", textDecoration: "none", color: "var(--foreground)", fontWeight: 600 }}>
            Login
          </Link>
        </nav>
      )}

      <Routes>
    {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
    {/* Auth pages */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />

        {/* Protected group */}
        <Route element={<ProtectedRoute />}>
          <Route path="/events" element={<EventDiscovery />} />
          <Route path="/me/tickets" element={<MyTickets />} />
          <Route path="/tickets/:tid/qr" element={<TicketQR />} />
        </Route>

        {/* Ticket flow (public endpoints that don’t require role) */}
        <Route path="/events/:eventId/ticket" element={<TicketConfirmation />} />
        <Route path="/events/:eventId/buy" element={<BuyTicket />} />

        {/* Organizer/Admin restricted routes */}
        <Route element={<OrganizerRoute />}>
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/events/:eventId/edit" element={<EventEdit />} />
          <Route path="/events/:eventId/scan" element={<EventScanner />} />
          <Route path="/events/:eventId/attendees" element={<AttendeeList />} />
          <Route path="/tickets/scan" element={<TicketScanner />} />
          <Route path="/events/:eventId/analytics" element={<EventAnalyticsDashboard />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/organizer-approval" element={<OrganizerApproval />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
        </Route>

  {/* Keep events discovery accessible */}
  <Route path="/events" element={<EventDiscovery />} />
      </Routes>
    </>
  );
}

export default function App() {
  // Debug helper visible in browser console to confirm React render begins
  console.log('[debug] App render start');

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

