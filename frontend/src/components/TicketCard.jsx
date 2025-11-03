export default function TicketCard({ t }) {
return (
<div className="rounded-xl border p-4 bg-white flex gap-4 items-center">
<div className="flex-1">
<div className="font-medium">{t.event_title || t.event?.title || "Unnamed Event"}</div>
<div className="text-sm text-gray-600">{t.event_start ? new Date(t.event_start).toLocaleString() : ""}</div>
<div className="text-xs text-gray-500">Ticket: {t.code || t.id}</div>
</div>
<div className="w-28 h-28 border rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
{t.qr_url ? (
<img src={t.qr_url} alt="QR" className="w-full h-full object-contain" />
) : (
<span className="text-[11px] text-gray-400 text-center p-2">QR provided by check‑in pipeline</span>
)}
</div>
</div>
);
}