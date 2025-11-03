import { useEffect, useMemo, useState } from "react";
import { MeAPI } from "../../api/api";

export default function StudentCalendarPage({ items = [] }) {
  const [mode, setMode] = useState("month"); // "month" | "week"
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded-md border text-sm ${
            mode === "month" ? "bg-gray-100" : ""
          }`}
          onClick={() => setMode("month")}
        >
          Month
        </button>
        <button
          className={`px-3 py-1 rounded-md border text-sm ${
            mode === "week" ? "bg-gray-100" : ""
          }`}
          onClick={() => setMode("week")}
        >
          Week
        </button>
      </div>

      <CalendarGrid items={items} mode={mode} onSelect={setSelected} />

      {selected && (
        <div className="mt-4 border rounded-lg p-3 bg-gray-50">
          <div className="font-medium">{selected.title}</div>
          <div className="text-sm text-gray-600">
            {formatRange(selected.start, selected.end)}
          </div>
          <a
            href={`/events/${selected.id}`}
            className="text-sm mt-2 inline-block px-3 py-1 border rounded-md"
          >
            View event
          </a>
        </div>
      )}
    </div>
  );
}

function CalendarGrid({ items, mode, onSelect }) {
  // Minimal calendar: list grouped by day (month) or next 7 days (week)
  const byDay = useMemo(() => {
    const map = new Map();
    (items || []).forEach((e) => {
      const d = e.start ? new Date(e.start) : new Date();
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return Array.from(map.entries()).sort(
      ([a], [b]) => new Date(a) - new Date(b)
    );
  }, [items]);

  const days = mode === "week" ? byDay.slice(0, 7) : byDay;

  if (days.length === 0) {
    return <div className="text-sm text-gray-500">No upcoming events.</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {days.map(([day, evs]) => (
        <div key={day} className="rounded-lg border p-3">
          <div className="text-xs text-gray-500 mb-2">
            {new Date(day).toDateString()}
          </div>
          <div className="flex flex-col gap-2">
            {evs
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              .map((e) => (
                <button
                  key={e.id}
                  onClick={() => onSelect(e)}
                  className="text-left px-2 py-1 rounded-md border hover:bg-gray-50"
                >
                  <div className="text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-gray-600">
                    {formatRange(e.start, e.end)}
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatRange(start, end) {
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  if (!s) return "";
  const t = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const ds = s.toLocaleDateString();
  const de = e?.toLocaleDateString();
  return !e || ds === de
    ? `${ds} • ${t(s)}${e ? `–${t(e)}` : ``}`
    : `${s.toLocaleString()} → ${e.toLocaleString()}`;
}
