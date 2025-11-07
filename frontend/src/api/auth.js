// src/api/auth.js
// Compute the API root so callers can use paths like `${API_ROOT}/users/me/`.
// If VITE_API_URL is set it may or may not include the `/api` suffix. Normalize
// it so API_ROOT always contains the `/api` segment (or default to the proxy
// `/api` during local dev).
const rawApi = import.meta.env.VITE_API_URL;
let API_ROOT;
if (rawApi) {
  const r = rawApi.replace(/\/$/, '');
  API_ROOT = r.endsWith('/api') ? r : `${r}/api`;
} else {
  API_ROOT = '/api';
}

export async function login(email, password) {
  const res = await fetch(`${API_ROOT}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Invalid email or password");

  const data = JSON.parse(text);
  if (!data.access) throw new Error("No access token returned");

  // Persist tokens
  localStorage.setItem("access", data.access);
  if (data.refresh) localStorage.setItem("refresh", data.refresh);
  // (Optional) store email so we can show a name in the header
  localStorage.setItem("email", email);

  // pick a landing route if you like
  return {
    route:
      email === "admin@test.com" ? "/admin" :
      email.includes("organizer") ? "/organizer" : "/events",
  };
}

export async function registerStudent(full_name, email, password) {
  const res = await fetch(`${API_ROOT}/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: full_name,
      email,
      password,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    try {
      const data = JSON.parse(text);
      throw new Error(data.detail || JSON.stringify(data));
    } catch {
      throw new Error(text || "Registration failed");
    }
  }

  return JSON.parse(text);
}


export async function getProfile() {
  const res = await fetch(`${API_ROOT}/users/me/`, {
    credentials: 'include',
    headers: { Accept: "application/json", ...authHeaders() },
  });
  if (res.status === 401) return null;         // not logged in / expired
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("email");
}

export function getAccessToken() {
  // Support both legacy and newer keys
  return localStorage.getItem("access") || localStorage.getItem("access_token") || null;
}

// Use this everywhere for protected requests
export function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Export a stable `BASE` name for other modules that import it.
export const BASE = API_ROOT;
