// src/api/events.js

const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const api = (p) => `${BASE}${p.startsWith("/") ? "" : "/"}${p}`;

// ✅ Get all events (Event Discovery page uses this)
// Accepts an options object: { baseUrl, token, date }
export async function fetchEvents({ baseUrl, token, date, from, to } = {}) {
  // Build a URL using the current origin as base so `new URL` accepts
  // relative paths returned by `api()` (which may be '/api/events/'). If
  // `api()` returns an absolute URL (when VITE_API_URL is a full origin),
  // new URL will still accept it.
  const url = new URL(api("/events/"), window.location.origin);
  if (date) url.searchParams.set("date", date);
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);

  const headers = { "Accept": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { credentials: 'include', headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ Get a single event (Buy Ticket page uses this)
export async function getEvent(id) {
  const res = await fetch(api(`/events/${id}/`), {
    credentials: 'include',
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
