const API_BASE = import.meta.env.VITE_API_BASE || ""; // e.g. "http://127.0.0.1:8000"


function toQuery(params) {
const u = new URLSearchParams();
Object.entries(params || {}).forEach(([k, v]) => {
if (v !== undefined && v !== null && v !== "") u.append(k, v);
});
return u.toString();
}


export async function apiGet(path, params = {}) {
  const accessToken = localStorage.getItem("access_token");
  console.log("API GET", path, params, accessToken);

  const query = params && Object.keys(params).length
    ? `?${new URLSearchParams(params).toString()}`
    : "";

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}${query}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
  }

  return res.json();
}



export const EventsAPI = {
search: (args) => apiGet("/api/events/", args),
get: (id) => apiGet(`/api/events/${id}/`),
categories: () => apiGet("/api/events/categories"), // if missing, fall back in UI
orgs: () => apiGet("/api/events/organizations"),
};


export const MeAPI = {
saved: () => apiGet("/api/users/me/saved-events/"),
registered: () => apiGet("/api/event/user/"),
calendar: () => apiGet("/api/users/me/calendar/")
};


export const TicketsAPI = {
mine: () => apiGet("/api/tickets/"),
};


