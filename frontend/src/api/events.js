// src/api/events.js

const BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const api = (p) => `${BASE}${p.startsWith("/") ? "" : "/"}${p}`;

// ✅ Get all events (Event Discovery page uses this)
export async function fetchEvents() {
  const res = await fetch(api("/api/events/"), {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ Get a single event (Buy Ticket page uses this)
export async function getEvent(id) {
  const res = await fetch(api(`/api/events/${id}/`), {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
