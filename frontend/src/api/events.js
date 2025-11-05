// src/api/events.js

const BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const api = (p) => `${BASE}${p.startsWith("/") ? "" : "/"}${p}`;

// ✅ Get all events (Event Discovery page uses this)
// Accepts an options object: { baseUrl, token, date }
export async function fetchEvents({ baseUrl, token, date } = {}) {
  const url = new URL(api("/api/events/"));
  if (date) {
    // expect date in YYYY-MM-DD
    url.searchParams.set("date", date);
  }
  const headers = { "Accept": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers });
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
