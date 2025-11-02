import React from "react";
import { useParams, Link } from "react-router-dom";
import { getEvent } from "../api/events";
import { getTicketByEvent } from "../api/tickets";
import { QRCodeCanvas } from "qrcode.react";
import "./TicketConfirmation.css";

export default function TicketConfirmation() {
  const { id } = useParams();
  const [event, setEvent] = React.useState(null);
  const [ticket, setTicket] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const [e, t] = await Promise.all([getEvent(id), getTicketByEvent(id)]);
        setEvent(e);
        setTicket(t);
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="buy-wrap"><div className="buy-loading">Loading…</div></div>;
  if (err) return <div className="buy-wrap"><div className="buy-error">{err}</div></div>;
  if (!event) return <div className="buy-wrap"><div className="buy-error">Event not found.</div></div>;

  const start = new Date(event.start_time);
  const when = start.toLocaleString();
  const qrValue = ticket?.ticket_id || ticket?.id || "";

  return (
    <div className="buy-wrap">
      <section className="buy-card">
        <h1 className="buy-title">Ticket confirmed <span className="ticket-emoji">🎟️</span></h1>
        <p className="buy-sub">Your ticket has been issued. Show this QR code at entry.</p>

        <div className="buy-grid">
          {/* LEFT side: event details (unchanged look) */}
          <div className="buy-left">
            <h3 className="event-name">{event.title}</h3>
            {event.organization && (
              <div><span className="buy-label">Organization:</span> {event.organization}</div>
            )}
            <div><span className="buy-label">When:</span> {when}</div>
            {event.description && <p className="buy-desc">{event.description}</p>}
            <Link className="btn subtle" to="/events" style={{marginTop:12}}>Back to Events</Link>
          </div>

          {/* RIGHT side: framed QR box with same proportions as before */}
          <div className="qr-panel">
            {qrValue ? (
              <QRCodeCanvas value={qrValue} size={256} includeMargin />
            ) : (
              <div className="qr-loading">Loading QR…</div>
            )}
            {/*{ticket?.qr_png_url && (
              <a
                className="qr-link"
                href={ticket.qr_png_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open QR image
              </a>
            )}*/}
          </div>
        </div>

        <div className="ticket-id">Ticket ID: {ticket?.ticket_id || "—"}</div>
      </section>
    </div>
  );
}
