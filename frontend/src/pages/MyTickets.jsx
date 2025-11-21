import React from "react";
import { Link, useNavigate } from "react-router-dom";
import TopRightProfile from "../components/TopRightProfile";
import { useAuth } from "../components/AuthProvider";   
import "./MyTickets.css";
import placeholder from "../assets/placeholder.svg";
import { getMyTickets, cancelTicket } from "../api/tickets.js";

function icsEscape(s = "") {
  return String(s).replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

function toICSDate(dtLike) {
  const d = new Date(dtLike);
  const valid = isNaN(d.getTime()) ? new Date() : d;
  // 20251104T120000Z
  return valid.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Build and download a .ics file for this event */
function downloadICS(ev = {}) {
  const start =
    ev.start_time || ev.start || ev.starts_at || ev.begin_at || null;
  // If no explicit end, default to +1 hour
  const end =
    ev.end_time ||
    ev.end ||
    ev.ends_at ||
    (start ? new Date(new Date(start).getTime() + 60 * 60 * 1000) : null);

  const dtstamp = toICSDate(new Date());
  const dtstart = start ? toICSDate(start) : null;
  const dtend = end ? toICSDate(end) : null;

  const uid = `${(ev.id ?? "event")}-${Date.now()}@campusevents`;
  const summary = icsEscape(ev.title || ev.name || "Event");
  const description = icsEscape(ev.description || "");
  const location = icsEscape(
    ev.location || ev.venue || ev.venue_name || ev.organization || ""
  );
  const url = icsEscape(`${window.location.origin}/events/${ev.id ?? ""}`);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Campus Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    dtstart ? `DTSTART:${dtstart}` : null,
    dtend ? `DTEND:${dtend}` : null,
    `SUMMARY:${summary}`,
    description ? `DESCRIPTION:${description}` : null,
    location ? `LOCATION:${location}` : null,
    url ? `URL:${url}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const fname = (ev.title || "event")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-");
  a.download = `${fname || "event"}.ics`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}


/** Reusable inline Modal (no external import) */
function Modal({ open, onClose, title, children, footer }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          width: "min(680px, 92vw)",
          maxHeight: "85vh",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{ border: 0, background: "transparent", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: 20, overflow: "auto" }}>{children}</div>

        {footer ? (
          <div style={{ padding: 16, borderTop: "1px solid #eee", display: "flex", gap: 12, justifyContent: "flex-end" }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { ready, access } = useAuth() || { ready: true, access: null }; // fallback if provider absent

  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [actBusy, setActBusy] = React.useState(false);
  const [actErr, setActErr] = React.useState("");

  React.useEffect(() => {
    if (!ready) return;                     // ✅ wait for auth to settle
    if (!access) {                          // if somehow not logged in, bounce
      navigate("/auth/login", { replace: true });
      return;
    }
    (async () => {
      try {
        const data = await getMyTickets();  // now token is present → no 401 on refresh
        setTickets(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, access, navigate]);

  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? String(iso)
      : d.toLocaleString("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const shortId = (id) => (id ? id.slice(0, 8) + "…" : "");

  const filtered = tickets.filter((t) => {
    const ev = t?.event || {};
    const hay = `${ev.title ?? ""} ${t?.owner_email ?? ""} ${t?.qr_code ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const handleCancel = async () => {
        const evId = selected?.event?.id;
        if (!evId) return;
        if (!window.confirm("Cancel your registration for this event?")) return;

        setActErr("");
        setActBusy(true);
        try {
            await cancelTicket(evId); // calls ../api/tickets cancelTicket
            setTickets(prev =>
            prev.filter(x => (x.id || x.ticket_id) !== (selected.id || selected.ticket_id))
            );
            setSelected(null);
        } catch (e) {
            setActErr(e?.message || "Failed to cancel. Please try again.");
        } finally {
            setActBusy(false);
        }
    };

  return (
    <div className="tickets-page">
      <header className="tickets-header">
        <div className="header-left">
          <h1>My Tickets</h1>
          <Link className="btn primary" to="/events">Back to Events</Link>
        </div>
        <div className="header-right">
          {/* Optional: hide auth links on this page */}
          <TopRightProfile showAuthLinks={false} />
        </div>
      </header>

      {(!ready || loading) && (
        <div className="tickets-skeleton">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="ticket-card skeleton" key={i} />
          ))}
        </div>
      )}

      {ready && !loading && error && <div className="error-banner">{error}</div>}

      {ready && !loading && !error && (
        <>
          <div className="toolbar">
            <input
              className="search"
              placeholder="Search tickets (title, email, code)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <span className="count">{filtered.length} total</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-emoji">🎟️</div>
              <h2>No tickets yet</h2>
              <p>Browse upcoming events and grab your first ticket.</p>
              <Link className="btn primary" to="/events">Discover Events</Link>
            </div>
          ) : (
            <div className="tickets-grid">
              {filtered.map((t, i) => {
                const ev = t?.event || {};
                const tid = t?.id || t?.ticket_id || String(i);
        const start = ev.start_time || ev.start || ev.starts_at || ev.begin_at || null;

        const title = ev.title || ev.name || "Event details";
        const when = start;
        // prefer several possible image fields; fall back to a stable placeholder
                const img = ev.image_url || ev.image || ev.thumbnail_url || ev.thumbnail || null;
                const placeholderSrc = placeholder;

                return (
                  <article className="ticket-card" key={tid}>
                    <div className="thumb">
                      <img
                        src={img || placeholderSrc}
                        alt={title}
                        // If the URL is bad, replace with placeholder
                        onError={(e) => { e.currentTarget.src = placeholderSrc; }}
                        style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 8 }}
                      />
                    </div>

                    {/*<div className="title-row">
                    <h3 className="title">{title}</h3>
                    <span className={`badge ${t?.is_used ? "used" : "active"}`}>
                        {t?.is_used ? "Used" : "Active"}
                    </span>
                    </div>*/}

                    <div className="meta">
                      <div className="title-row">
                        <h3 className="title">{ev.title || "Untitled Event"}</h3>
                        {/*<span className={`badge ${t?.is_used ? "used" : "active"}`}>
                          {t?.is_used ? "Used" : "Active"}
                        </span>*/}
                      </div>

                      <div className="sub">
                        <span className="when">{fmtDate(start)}</span>
                        {ev.organization ? <span className="dot">•</span> : null}
                        {ev.organization ? <span className="org">{ev.organization}</span> : null}
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        className="btn subtle"
                        type="button"
                        onClick={() => { setActErr(""); setSelected(t); }}
                        title="View event details"
                      >
                        View
                      </button>

                      {t?.qr_png_url ? (
                        <a className="btn primary" href={t.qr_png_url} target="_blank" rel="noopener" title="Open QR code">QR</a>
                      ) : (
                        <Link className="btn primary" to={`/tickets/${tid}/qr`} target="_blank" rel="noopener" title="Open QR code">QR</Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.event?.title || "Event details"}
        footer={
          <>
            {actErr ? <span style={{ marginRight: "auto", color: "#b00020" }}>{actErr}</span> : null}
            <button className="btn" type="button" onClick={() => setSelected(null)} disabled={actBusy}>
              Close
            </button>
            {selected?.event?.google_calendar_url && (
              <a
                href={selected.event.google_calendar_url}
                target="_blank"
                rel="noreferrer"
              >
                <button
                  className="btn"
                  type="button"
                  disabled={actBusy}
                >
                  Add to Google Calendar
                </button>
              </a>
            )}
            <button
              className="btn danger"
              type="button"
              disabled={actBusy || selected?.is_used}
              onClick={async () => {
                const evId = selected?.event?.id;
                if (!evId) return;
                if (!window.confirm("Cancel your registration for this event?")) return;
                setActErr("");
                setActBusy(true);
                try {
                  await cancelTicket(evId);
                  setTickets((prev) => prev.filter((x) => (x.id || x.ticket_id) !== (selected.id || selected.ticket_id)));
                  setSelected(null);
                } catch (e) {
                  setActErr(e?.message || "Failed to cancel. Please try again.");
                } finally {
                  setActBusy(false);
                }
              }}
            >
              {actBusy ? "Cancelling…" : "Cancel registration"}
            </button>
          </>
        }
      >
        {(() => {
          const ev = selected?.event || {};
          const when = ev.start_time || ev.start_time || ev.start || null;
          return (
            <div className="event-details">
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <img
                  src={ev.image_url || "https://via.placeholder.com/160x120?text=Event"}
                  alt={ev.title || "Event"}
                  style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 8 }}
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/160x120?text=Event")}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "4px 0 6px", color: "#555" }}>
                    {ev.organization ? <><strong>{ev.organization}</strong> · </> : null}
                    {when ? <span>{fmtDate(when)}</span> : null}
                  </p>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {ev.description || "No description provided."}
                  </p>
                </div>
              </div>

              <hr style={{ margin: "16px 0", border: 0, borderTop: "1px solid #eee" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><strong>Ticket ID:</strong> {selected?.id || selected?.ticket_id}</div>
                {/*<div><strong>Status:</strong> {selected?.is_used ? "Used" : "Active"}</div>*/}
                {selected?.owner_email ? <div><strong>Email:</strong> {selected.owner_email}</div> : null}
                {selected?.qr_code ? <div><strong>QR payload:</strong> {selected.qr_code}</div> : null}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}