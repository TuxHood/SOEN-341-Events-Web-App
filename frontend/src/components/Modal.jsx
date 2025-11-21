import React from "react";

export default function Modal({ open, onClose, title, children, footer }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => (e.key === "Escape" ? onClose() : null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      aria-hidden="true"
      role="presentation"
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
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
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
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "transparent", fontSize: 22, lineHeight: 1, cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, overflow: "auto" }}>
          {children}
        </div>

        {footer ? (
          <div style={{ padding: 16, borderTop: "1px solid #eee", display: "flex", gap: 12, justifyContent: "flex-end" }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
