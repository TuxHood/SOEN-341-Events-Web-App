import React from "react";
import { Link } from "react-router-dom";

export default function TicketScanner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 24 }}>
      <div style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Ticket Scanner (placeholder)</h1>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>
          This page is a scanner entry point. You can integrate a camera-based QR scanner here
          (for example using getUserMedia plus a QR decode library) to scan tickets and call the
          check-in API. For now this is a placeholder page.
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Link to="/organizer" className="rounded border px-4 py-2" style={{ textDecoration: 'none' }}>Return to Organizer</Link>
        </div>
      </div>
    </div>
  );
}
