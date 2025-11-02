import React from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const api = (p) => `${BASE}${p}`;
const authHeaders = () => {
  const t = localStorage.getItem("access");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function TicketQR() {
  const { tid } = useParams();
  const [ticket, setTicket] = React.useState(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(api(`/api/tickets/${tid}/`), {
          headers: { "Content-Type": "application/json", ...authHeaders() },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (alive) setTicket(data);
      } catch (e) {
        setErr(String(e?.message || e));
      }
    })();
    return () => { alive = false; };
  }, [tid]);

  if (err) return <div style={{ padding: 24, color: "crimson" }}>Error: {err}</div>;
  if (!ticket) return <div style={{ padding: 24 }}>Loading…</div>;

  const value = ticket.qr_code || String(ticket.id);

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <QRCodeCanvas value={value} size={320} includeMargin />
    </div>
  );
}
