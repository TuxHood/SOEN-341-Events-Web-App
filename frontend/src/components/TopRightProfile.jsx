// src/components/TopRightProfile.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAccessToken } from "../api/auth.js";
import { useAuth } from "./AuthProvider";

export default function TopRightProfile() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const ctx = typeof useAuth === "function" ? useAuth() : null;

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Prefer the auth provider's user state so expired tokens don't display a
  // stale placeholder. If the provider indicates there's no user, show
  // explicit Sign in / Sign up buttons.
  const user = ctx?.user ?? null;

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current || !btnRef.current) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  // Not logged in -> show prominent login and register buttons
  if (!user) {
    const btn = {
      padding: '8px 12px',
      borderRadius: 6,
      border: '1px solid rgba(0,0,0,0.08)',
      background: 'transparent',
      cursor: 'pointer',
      fontWeight: 600,
    };
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link to="/auth/login"><button style={btn}>Sign in</button></Link>
        <Link to="/auth/sign-up"><button style={{ ...btn, background: '#7f1d1d', color: 'white', border: '1px solid #7f1d1d' }}>Register</button></Link>
      </div>
    );
  }

  // Derive friendly name/role without hitting the backend
  const email = ctx?.user?.email || localStorage.getItem("email") || "";
  const displayName =
    ctx?.user?.name ||
    (email ? email.split("@")[0].replace(/\./g, " ") : "Student");
  const initial = (displayName[0] || "S").toUpperCase();
  const role =
    ctx?.user?.role ||
    (email.includes("admin") ? "admin" : email.includes("organizer") ? "organizer" : "student");

  function handleLogout() {
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      ctx?.logout?.(); // call provider logout if present
    } finally {
      navigate("/auth/login", { replace: true });
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: 0,
          cursor: "pointer",
        }}
      >
        <span style={{ fontWeight: 600 }}>{displayName}</span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
          }}
        >
          {initial}
        </div>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 7l5 6 5-6H5z" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            width: 220,
            background: "white",
            borderRadius: 8,
            border: "1px solid #ddd",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          {role === "student" && (
            <>
              <DropdownItem to="/me/tickets" label="My Tickets" />
              <Divider />
            </>
          )}
          {role === "organizer" && (
            <>
              <DropdownItem to="/organizer" label="Organizer Dashboard" />
              <Divider />
            </>
          )}
          {role === "admin" && (
            <>
              <DropdownItem to="/admin" label="Admin" />
              <Divider />
            </>
          )}

          <button onClick={handleLogout} style={itemStyle}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function DropdownItem({ to, label }) {
  return (
    <Link to={to} style={itemStyle}>
      {label}
    </Link>
  );
}

const itemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "10px 14px",
  fontSize: 14,
  background: "transparent",
  border: 0,
  cursor: "pointer",
  textDecoration: "none",
  color: "black",
};

function Divider() {
  return <div style={{ height: 1, background: "#ddd" }} />;
}
