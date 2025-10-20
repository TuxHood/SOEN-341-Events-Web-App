import React, { useState, useMemo } from "react";
import "./EventDiscovery.css"; 

const CONCORDIA = {
  maroon: "#8C1D40",
  gold: "#FFC72C",
};

export default function EventDiscovery() {
  
  const [filter, setFilter] = useState("today");
  const [category, setCategory] = useState("");
  const [organization, setOrganization] = useState("");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- Hard-coded events, for now - will need to change to get data from backend eventually ---
  const events = [
    {
      id: 1,
      title: "AI in 2025",
      time: "3:00 PM",
      date: "2025-10-14",
      category: "Tech",
      organization: "IEEE Concordia",
      description:
        "Explore the latest advancements in artificial intelligence with guest speakers from industry and academia.",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 2,
      title: "Battle of the Bands",
      time: "8:00 PM",
      date: "2025-10-20",
      category: "Music",
      organization: "Student Union",
      description:
        "Watch Concordia’s best bands compete live on stage. A night of sound, lights, and student talent!",
      image:
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: 3,
      title: "Basketball Finals",
      time: "6:00 PM",
      date: "2025-10-16",
      category: "Sports",
      organization: "Athletics Dept.",
      description:
        "The grand finale of the interfaculty basketball league — come cheer for your department!",
      image:
        "https://t4.ftcdn.net/jpg/00/62/39/19/360_F_62391976_WKbOA72PbU28IAfUjn6tLAPz3e2IVxdr.jpg",
    },
  ];

  // --- Derived lists ---
  const categories = useMemo(() => [...new Set(events.map(e => e.category))], [events]);
  const orgs = useMemo(() => [...new Set(events.map(e => e.organization))], [events]);

  // --- Filtering ---
  const filtered = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || e.category === category;
    const matchesOrg = !organization || e.organization === organization;
    return matchesSearch && matchesCategory && matchesOrg;
  });

  // --- Today ---
  const today = new Date();
  const formattedToday = today.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // --- Modal component ---
  const EventModal = ({ event, onClose }) => {
    if (!event) return null;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h2>{event.title}</h2>
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Location:</strong> {event.organization}</p>
          <p>{event.description}</p>
          <button className="claim-btn">Buy Ticket</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };

  // --- Single return for the entire component ---
  return (
    <div className="event-page">
      {/* Header */}
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

    <div className="auth-buttons">
      <button className="login-btn">Log In</button>
      <button className="signup-btn">Sign Up</button>
    </div>
  </div>
</header>
      <div className="event-grid">
        {/* Filters */}
        <aside className="filter-panel">
          <div className="filter-card">
            <h3>Calendar</h3>
            <p>{formattedToday}</p>
            <input type="date" value={today.toISOString().split("T")[0]} readOnly />
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
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-card">
            <h3>Organization</h3>
            <select value={organization} onChange={(e) => setOrganization(e.target.value)}>
              <option value="">All</option>
              {orgs.map((o) => (
                <option key={o}>{o}</option>
              ))}

              
            </select>
          </div>
        </aside>

        {/* Event list */}
        <main className="event-list">
          <h2>{filter.charAt(0).toUpperCase() + filter.slice(1)} Events</h2>
          {filtered.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <div className="event-cards">
              {filtered.map((e) => (
                <div key={e.id} className="event-card" onClick={() => setSelectedEvent(e)}>
                  <img src={e.image} alt={e.title} />
                  <div className="event-info">
                    <h3>{e.title}</h3>
                    <p className="org">{e.organization}</p>
                    <p className="date">
                      {new Date(e.date).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                      })} • {e.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
