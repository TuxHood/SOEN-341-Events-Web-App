// src/api/events.js

const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const api = (p) => `${BASE}${p.startsWith("/") ? "" : "/"}${p}`;
import apiClient from './apiClient';

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

// Update an event (PATCH) using the centralized axios client so Authorization
// header and CSRF handling are consistent. Returns the updated event object.
export async function updateEvent(id, payload) {
  // apiClient is an axios instance with interceptors that attach Authorization
  // and attempt refresh on 401. It also handles CSRF token setup for unsafe methods.
  const res = await apiClient.patch(`/events/${id}/`, payload);
  return res.data;
}

// Create a new event using axios client
export async function createEvent(payload) {
  const res = await apiClient.post(`/events/`, payload);
  return res.data;
}

// Delete event
export async function deleteEvent(id) {
  const res = await apiClient.delete(`/events/${id}/`);
  return res.data;
}
