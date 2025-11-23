import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { API_ENDPOINTS, apiCall } from '../api/config';
import api from '../api/apiClient';

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
      // Ensure csrf cookie is present (dev helper) before POSTing
      try {
        // Use the axios instance which sets withCredentials so the cookie is
        // correctly stored by the browser behind the Vite proxy. The CSRF
        // helper is exposed under the `users` include at `/api/users/csrf/`.
        // Calling `/csrf/` hits the Vite server (dev) and returns 404.
        await api.get('/users/csrf/');
      } catch (e) {
        // ignore; if csrf endpoint isn't reachable the login may still work
      }

      const result = await apiCall(API_ENDPOINTS.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!result.ok) {
        // Show backend error message when available
        const message = result.data && (result.data.detail || result.data.error || JSON.stringify(result.data));
        setError(message || 'Invalid email or password');
        return;
      }

  // Login success: store token and redirect based on role
  const user = result.data.user;
  if (setUser) setUser(user);
      // Store access token for API use (frontend may also read cookie set by backend)
      if (result.data.access) {
        // Persist access token under both keys used across the codebase to
        // remain backward-compatible with older helpers (`access`) and newer
        // code (`access_token`).
        localStorage.setItem('access_token', result.data.access);
        try { localStorage.setItem('access', result.data.access); } catch (e) {}
        // Ensure axios instance also sends the new token for subsequent requests
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${result.data.access}`;
        } catch (e) {
          // ignore if axios isn't available
        }
      }

      // route by role, with fallbacks
      const roleRoute = user?.role === "admin" ? "/admin" : user?.role === "organizer" ? "/organizer" : "/events";

      navigate(returnTo || roleRoute);
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
        background: "#8C1D40",
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
              color: "#8C1D40",
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
                color: "#8C1D40",
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
                  color: "#8C1D40",   

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
                  color: "#8C1D40",  

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
            style={{
                  width: "100%",
                  marginTop: "0.5rem",
                  background: "#8C1D40",   
                  color: "white",           
                  padding: "0.85rem",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                                      }}

          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
