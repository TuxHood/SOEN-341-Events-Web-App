// src/api/auth.js
const BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/token/`, {
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

export async function getProfile() {
  const res = await fetch(`${BASE}/api/users/me/`, {
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
  return localStorage.getItem("access") || null;
}

// Use this everywhere for protected requests
export function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export { BASE };
