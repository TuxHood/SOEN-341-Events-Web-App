// src/pages/BuyTicket.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopRightProfile from "../components/TopRightProfile";
import { getEvent } from "../api/events";
import { buyTicket } from "../api/tickets";
import "./BuyTicket.css";

export default function BuyTicket() {
  const { eventId } = useParams();
  const nav = useNavigate();
  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const e = await getEvent(eventId);
        setEvent(e);
      } catch (err) {
        setErr(String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  const onConfirm = async () => {
    try {
      setBusy(true);
      setErr("");
  const t = await buyTicket(eventId); // creates or returns existing
  nav(`/events/${eventId}/ticket`);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="buy-wrap"><div className="buy-loading">Loading…</div></div>;
  if (err) {
  return (
    <div className="buy-wrap">
      <div
        className="buy-error"
        style={{
          textAlign: "center",
          padding: "20px",
          maxWidth: "600px",
          margin: "40px auto",
          borderRadius: "10px"
        }}
      >
        {err}

        <div style={{ marginTop: 16 }}>
          <button
            className="buy-btn"
            onClick={() => nav("/events")}
            style={{
              backgroundColor: "#800020", // Concordia maroon
              color: "white",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ← Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}

  if (!event) return <div className="buy-wrap"><div className="buy-error">Event not found.</div></div>;

  const start = new Date(event.start_time);
  const end   = event.end_time ? new Date(event.end_time) : null;

  return (
    <div className="buy-page">
      {/* Slim header with profile */}
      <header className="buy-header">
        <div className="buy-header-left">
            <button className="buy-link" onClick={() => nav(-1)}>← Back</button>
        </div>
        <div className="buy-header-center"></div>   {/* keep empty */}
        <div className="buy-header-right">
            <TopRightProfile />
        </div>
    </header>

      <main className="buy-wrap">
        <section className="buy-card">
          <h1 className="buy-title">{event.title}</h1>

          <div className="buy-meta">
            <div><span className="buy-label">Organizer:</span> {event.organization || "—"}</div>
            <div><span className="buy-label">Category:</span> {event.category || "—"}</div>
            <div>
              <span className="buy-label">When:</span>{" "}
              {start.toLocaleString()} {end ? <>— {end.toLocaleString()}</> : null}
            </div>
            {event.venue && (
              <div><span className="buy-label">Where:</span> {event.venue}</div>
            )}
          </div>

          {event.description && (
            <p className="buy-desc">{event.description}</p>
          )}

          {err && <div className="buy-error" style={{marginTop: 12}}>{err}</div>}

          <div className="buy-actions">
            {event.is_approved === false ? (
              <div style={{ padding: 12, background: '#fff7ed', color: '#92400e', borderRadius: 8 }}>
                This event is pending approval and is not open for registration.
              </div>
            ) : (
              <button className="buy-btn buy-confirm" onClick={onConfirm} disabled={busy}>
                {busy ? "Processing…" : "Confirm purchase"}
              </button>
            )}
            <button className="buy-btn buy-cancel" onClick={() => nav(-1)} disabled={busy}>
              Cancel
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
