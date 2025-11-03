export default function EventCard({ evt, children }) {
return (
<div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col">
{evt.poster_url ? (
<img src={evt.poster_url} alt={evt.title} className="h-40 w-full object-cover" />
) : (
<div className="h-40 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No image</div>
)}
<div className="p-4 flex-1 flex flex-col gap-2">
<div className="text-base font-semibold leading-tight">{evt.title}</div>
<div className="text-sm text-gray-600">
{formatDateTimeRange(evt.start, evt.end)}
</div>
<div className="text-xs text-gray-500">
{(evt.category || "Uncategorized")} • {(evt.organization || "—")}
</div>
<div className="mt-auto flex gap-2 flex-wrap">{children}</div>
</div>
</div>
);
}


function formatDateTimeRange(start, end){
const s = start ? new Date(start) : null;
const e = end ? new Date(end) : null;
if(!s) return "";
const sameDay = e && s.toDateString() === e.toDateString();
return sameDay
? `${s.toLocaleDateString()} • ${s.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}–${e.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
: `${s.toLocaleString()}${e ? ` → ${e.toLocaleString()}`: ""}`;
}