import React, { useEffect, useMemo, useState } from "react";
import "./EventDiscovery.css";
import TopRightProfile from "../components/TopRightProfile";
import { fetchEvents } from "../api/events";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../api/auth.js";


export default function EventDiscovery() {
 const access = getAccessToken();
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [err, setErr] = useState("");
  // selected date for the calendar (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState("");
  // For a smooth UX, keep a raw input value and debounce updates to `selectedDate`.
  const [selectedDateRaw, setSelectedDateRaw] = useState("");




 const parseDate = (v) => {
 if (!v) return null;
 let d = new Date(v);
 if (!Number.isNaN(d.getTime())) return d;
 d = new Date(String(v).replace(" ", "T"));
 if (!Number.isNaN(d.getTime())) return d;
 d = new Date(String(v).replace(" ", "T") + "Z");
 return Number.isNaN(d.getTime()) ? null : d;
};


 const fmtDate = (d) =>
   d ? d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "Date TBA";
 const fmtTime = (d) =>
 d ? d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" }) : "TBA";
 const [filter, setFilter] = useState("today");
 const [category, setCategory] = useState("");
 const [organization, setOrganization] = useState("");
 const [search, setSearch] = useState("");
 const [selectedEvent, setSelectedEvent] = useState(null);


useEffect(() => {
  const load = async () => {
    setLoading(true);
    setErr("");
        try {
        // Only request a specific date from the API when the UI is in the "today" filter.
        // When the user selects "upcoming" or "ongoing", we want the server to return
        // the appropriate set (not limited to the chosen calendar date).
        const dateToSend = (filter === "today" || filter === "ongoing") ? (selectedDate || undefined) : undefined;
        const fromToSend = (filter === "upcoming") ? (selectedDate || undefined) : undefined;

        const data = await fetchEvents({
          baseUrl: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
          token: access || null,
          date: dateToSend,
          from: fromToSend,
        });

      // Normalize API response: support either an array or a paginated { results: [...] } object
      const items = Array.isArray(data) ? data : (data && data.results) ? data.results : [];

      if (items && items.length) console.log("API sample event:", items[0]);

      const shaped = items.map((e) => {
        const start = parseDate(e.start_time);
        const end = parseDate(e.end_time) || start;

        return {
          id: e.id,
          title: e.title,
          description: e.description || "",
          organization: e.organization || e.organizer_name || "",
          category: e.category || e.category_name || "",
          venue: e.venue || e.venue_name || "",
          image:
            e.image_url ||
            "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?q=80&w=800&auto=format&fit=crop",
          dateLabel: fmtDate(start),
          timeLabel: fmtTime(start),
          startMs: start ? start.getTime() : null,
          endMs: end ? end.getTime() : null,
        };
      });
      setEvents(shaped);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };
  load();
}, [access, selectedDate, filter]);




 const categories = useMemo(() => [...new Set(events.map(e => e.category).filter(Boolean))], [events]);
 const orgs = useMemo(() => [...new Set(events.map(e => e.organization).filter(Boolean))], [events]);


// Helper: create a local Date at midnight for a YYYY-MM-DD string (avoids UTC parsing oddities)
function makeLocalDateFromIso(iso) {
  if (!iso) return null;
  const parts = String(iso).split("-").map((s) => Number(s));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Compute the day window to use for the "today" filter. If the user selected
// a date in the calendar, use that day (local midnight); otherwise default to the current day.
const selectedDayBase = selectedDate ? makeLocalDateFromIso(selectedDate) : new Date();
const todayStart = new Date(selectedDayBase);
todayStart.setHours(0, 0, 0, 0);
const todayEnd = new Date(selectedDayBase);
todayEnd.setHours(23, 59, 59, 999);

// Reference time used for 'ongoing' and 'upcoming' filters. Use local midday for the selected date
// to avoid timezone edge cases (midnight UTC shifting to previous day in some zones).
const now = (() => {
  if (filter === "ongoing" || filter === "upcoming") {
    if (selectedDate) {
      const d = makeLocalDateFromIso(selectedDate);
      if (d) {
        d.setHours(12, 0, 0, 0);
        return d.getTime();
      }
    }
    return Date.now();
  }
  return Date.now();
})();


 // Client-side filters (search, category, org)
 const filtered = events
 .filter((e) => {
   // text/category/org filters
   const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
   const matchesCategory = !category || e.category === category;
   const matchesOrg = !organization || e.organization === organization;
   if (!(matchesSearch && matchesCategory && matchesOrg)) return false;

   // ignore items without a start time
   if (e.startMs == null) return false;
   const start = e.startMs;
   const end = e.endMs ?? e.startMs;

   // date filter logic
   if (filter === "today") {
     // event intersects today at any time
     return end >= todayStart.getTime() && start <= todayEnd.getTime();
   }
   if (filter === "ongoing") {
     // happening at the reference moment (selected date or current time)
     return start <= now && now <= end;
   }
   if (filter === "upcoming") {
     // starts after the reference moment (selected date or current time)
     return start > now;
   }
   // default
   return true;
 })
 // nice default sort per mode
 .sort((a, b) => {
   if (filter === "ongoing") {
     // soonest to finish first
     return (a.endMs ?? a.startMs) - (b.endMs ?? b.startMs);
   }
   // otherwise sort by start time ascending
   return (a.startMs ?? Infinity) - (b.startMs ?? Infinity);
 });


// Today/selected date display
const today = new Date();
const todayIso = today.toISOString().split("T")[0];
const displayDate = selectedDate ? new Date(selectedDate) : today;
const formattedToday = displayDate.toLocaleDateString("en-CA", {
  weekday: "long", month: "long", day: "numeric", year: "numeric",
});

 // ensure selectedDate defaults to today on first render
 React.useEffect(() => {
   if (!selectedDate) setSelectedDate(todayIso);
 }, [selectedDate, todayIso]);

 // keep raw input in-sync when selectedDate is set programmatically
 React.useEffect(() => {
   if (selectedDate) setSelectedDateRaw(selectedDate);
 }, [selectedDate]);

 // Debounce changes from the input before applying to the active selectedDate used by filters
 React.useEffect(() => {
   const t = setTimeout(() => {
     if (selectedDateRaw !== selectedDate) setSelectedDate(selectedDateRaw);
   }, 250);
   return () => clearTimeout(t);
 }, [selectedDateRaw]);


 const EventModal = ({ event, onClose }) => {
 const navigate = useNavigate();


 function handleBuy() {
   navigate(`/events/${event.id}/buy`);
 }


 if (!event) return null;


 return (
   <div className="modal-overlay" onClick={onClose}>
     <div className="modal-content" onClick={(e) => e.stopPropagation()}>
       <h2>{event.title}</h2>


        <p><strong>Date:</strong> {event.dateLabel}</p>
        <p><strong>Time:</strong> {event.timeLabel || "TBA"}</p>

        <p><strong>Description:</strong></p>
        <p style={{ whiteSpace: "pre-wrap" }}>{event.description || "—"}</p>

        {event.organization && (
          <>
            <p><strong>Organization:</strong></p>
            <p>{event.organization}</p>
          </>
        )}


       <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
         <button className="claim-btn" onClick={handleBuy}>
           Buy Ticket
         </button>
         <button className="close-btn" onClick={onClose}>Close</button>
       </div>
     </div>
   </div>
 );
};




 return (
   <div className="event-page">
     <header className="event-header">
       <h1>Discover Campus Events</h1>
       <div className="header-right">
         <input
           type="text"
           placeholder="Search events..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="search-input"
         />
         <TopRightProfile />
       </div>
     </header>


     <div className="event-grid">
       <aside className="filter-panel">
         <div className="filter-card">
           <h3>Calendar</h3>
           <p>{formattedToday}</p>
           <input type="date" value={selectedDateRaw} onChange={(e) => setSelectedDateRaw(e.target.value)} />
           <div style={{ marginTop: 8 }}>
             <small style={{ color: '#666' }}>Active: <strong>{filter.charAt(0).toUpperCase() + filter.slice(1)}</strong></small>
             <div style={{ fontSize: 13, marginTop: 4 }}>Showing events for <strong>{displayDate.toLocaleDateString()}</strong></div>
           </div>
         </div>


         <div className="filter-card">
           <h3>Filter by Date</h3>
           {["today", "ongoing", "upcoming"].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={filter === f ? "active" : ""}
             >
               {f.charAt(0).toUpperCase() + f.slice(1)} Events
             </button>
           ))}
         </div>


         <div className="filter-card">
           <h3>Category</h3>
           <select value={category} onChange={(e) => setCategory(e.target.value)}>
             <option value="">All</option>
             {categories.map((c) => <option key={c}>{c}</option>)}
           </select>
         </div>


         <div className="filter-card">
           <h3>Organization</h3>
           <select value={organization} onChange={(e) => setOrganization(e.target.value)}>
             <option value="">All</option>
             {orgs.map((o) => <option key={o}>{o}</option>)}
           </select>
         </div>
       </aside>


       <main className="event-list">
  <h2>{filter.charAt(0).toUpperCase() + filter.slice(1)} Events</h2>

  {loading && <p>Loading events…</p>}
  {err && <p style={{ color: "crimson" }}>{err}</p>}

  {!loading && !err && (
    filtered.length === 0 ? (
      <p>No events found.</p>
    ) : (
      <div className="event-cards">
        {filtered.map((e) => {
          const imgSrc = (e.image_url || e.image || "").trim() || null;

          return (
            <div
              key={e.id}
              className="event-card"
              onClick={() => setSelectedEvent(e)}
            >
              {imgSrc && (
                <div
                  className="event-thumb"
                  style={{
                    height: 220,
                    backgroundImage: `url("${imgSrc}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                />
              )}

              <div className="event-info">
                <h3>{e.title}</h3>
                <p className="date">
                  {e.dateLabel}
                  {e.timeLabel ? ` • ${e.timeLabel}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )
  )}
</main>
     </div>


     {selectedEvent && (
       <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
     )}
   </div>
 );
}


