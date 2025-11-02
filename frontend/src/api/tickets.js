// src/api/tickets.js
import { BASE, authHeaders } from "./auth";

const api = (p) => `${BASE}${p.startsWith("/") ? "" : "/"}${p}`;

async function requireOk(res) {
  if (res.ok) return res;
  if (res.status === 401) {
    throw new Error('{"detail":"Authentication credentials were not provided."}');
  }
  let msg = `${res.status} ${res.statusText}`;
  try {
    const t = await res.text();
    if (t && t.trim()) msg = t;
  } catch {}
  throw new Error(msg);
}

export async function buyTicket(eventId) {
  const res = await fetch(api(`/api/events/${eventId}/buy/`), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

    if (!res.ok) {
        let msg = "Failed to buy ticket";
        try {
            const data = await res.json();
            msg = data.detail || JSON.stringify(data);
        } catch (err) {
            msg = await res.text();
        }
        throw new Error(msg);
        }
    return res.json();
}

export async function getMyTickets() {
  const res = await fetch(api(`/api/me/tickets/`), {
    headers: { Accept: "application/json", ...authHeaders() },
  }).then(requireOk);
  return res.json();
}

export async function getTicketByEvent(eventId) {
  const res = await fetch(api(`/api/events/${eventId}/ticket/`), {
    headers: { Accept: "application/json", ...authHeaders() },
  }).then(requireOk);
  return res.json();
}

export async function cancelTicket(eventId) {
  const res = await fetch(api(`/api/events/${eventId}/cancel/`), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTicketById(ticketId) {
  const res = await fetch(api(`/api/tickets/${ticketId}/`), {
    headers: { Accept: "application/json", ...authHeaders() },
  }).then(requireOk);
  return res.json();
}
