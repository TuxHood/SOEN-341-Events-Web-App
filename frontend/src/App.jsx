import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useAuth } from "./components/AuthProvider";
import "./App.css";

// Pages
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
import TicketConfirmation from "./pages/TicketConfirmation";
import BuyTicket from "./pages/BuyTicket";
import MyTickets from "./pages/MyTickets";
import TicketQR from "./pages/TicketQR";
import TicketScanner from "./pages/TicketScanner";
import EventScanner from "./pages/EventScanner";
import EventEdit from "./pages/EventEdit";

// 🔹 NEW: password reset pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Auth wrappers
import AuthProvider, { } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import OrganizerRoute from "./components/OrganizerRoute";
import AdminRoute from "./components/AdminRoute";

function AppShell() {
  const { pathname } = useLocation();
  const { user, ready } = useAuth();

  const isAdmin = Boolean(user && (user.role === "admin" || user.is_staff));
  const isOrganizer = Boolean(user && (user.role === "organizer" || isAdmin));

  return (
    <>
      <Routes>
        {/* Public: root defaults to event discovery */}
        <Route path="/" element={<EventDiscovery />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/events" element={<EventDiscovery />} />

        {/* Auth pages */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />

        {/* 🔹 NEW auth routes for password reset */}
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/auth/reset-password/:uidb64/:token"
          element={<ResetPassword />}
        />

        {/* Protected group */}
        <Route element={<ProtectedRoute />}>
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
          <Route
            path="/events/:eventId/analytics"
            element={<EventAnalyticsDashboard />}
          />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/organizer-approval"
            element={<OrganizerApproval />}
          />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  console.log("[debug] App render start");

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
