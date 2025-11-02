// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { login as apiLogin } from "../api/auth.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login: providerLogin, setUser } = useAuth() || {};

  const returnTo =
    location.state?.from?.pathname ||
    location.state?.returnTo ||
    null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    try {
      // your API helper
      const data = await apiLogin(email, password);

      if (data?.access) localStorage.setItem("access", data.access);
      if (data?.refresh) localStorage.setItem("refresh", data.refresh);

      setUser?.(data.user ?? { email });

      // optional provider login hook
      let providerRoute = null;
      if (typeof providerLogin === "function") {
        providerRoute = (await providerLogin(email, password))?.route;
      }

      // route by role, with fallbacks
      const roleRoute =
        data?.user?.role === "admin"
          ? "/admin"
          : data?.user?.role === "organizer"
          ? "/organizer"
          : "/events";

      navigate(providerRoute || returnTo || roleRoute);
    } catch (err) {
      setError(err?.message || "Invalid email or password");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F8FA",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "2.5rem",
          background: "var(--card)",
          borderRadius: "12px",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.875rem",
              fontWeight: "800",
              color: "var(--foreground)",
            }}
          >
            Sign in to your account
          </h2>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              color: "var(--muted-foreground)",
            }}
          >
            Or{" "}
            <Link
              to="/auth/sign-up"
              style={{
                fontWeight: "600",
                color: "var(--primary)",
                textDecoration: "none",
              }}
            >
              Create a new account
            </Link>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              background: "#fef2f2",
              borderRadius: "8px",
              border: "1px solid #fecaca",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#991b1b" }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form
          noValidate
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                htmlFor="email-address"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Email address
              </label>
              <input
                id="email-address"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error === "Please enter a valid email") setError("");
                }}
                onBlur={() => {
                  const emailRegex = /\S+@\S+\.\S+/;
                  if (email && !emailRegex.test(email)) {
                    setError("Please enter a valid email");
                  }
                }}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  outline: "none",
                }}
                placeholder="Email address"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  outline: "none",
                }}
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "0.5rem", color: "black" }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
