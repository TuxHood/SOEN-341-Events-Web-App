import { useEffect, useState } from "react";
import { MeAPI } from "../../api/api";

export default function StudentMyEventsPage() {
  const [saved, setSaved] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [s, r] = await Promise.all([
          MeAPI.saved().catch(() => []),
          MeAPI.registered().catch(() => []),
        ]);

        setSaved(s.results || s || []);
        setRegistered(r.results || r || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="grid gap-4">
          <Section
            title="Registered"
            events={registered}
            badge={{ text: "Registered", tone: "blue" }}
          />
          <Section
            title="Saved"
            events={saved}
            badge={{ text: "Saved", tone: "green" }}
          />
        </div>
      )}
    </div>
  );
}

function Section({ title, events, badge }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">
          {title} ({events.length})
        </h3>
      </div>

      <div className="divide-y">
        {events.length === 0 && (
          <div className="text-gray-500 text-sm">None yet.</div>
        )}

        {events.map((e) => (
          <div
            key={e.id}
            className="py-3 flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-sm text-gray-600">
                {e.start ? new Date(e.start).toLocaleString() : ""}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SmallBadge tone={badge.tone}>{badge.text}</SmallBadge>

              {e.calendar_url ? (
                <a
                  href={e.calendar_url}
                  className="text-sm px-3 py-1 border rounded-md"
                >
                  Add to Calendar
                </a>
              ) : (
                <button
                  disabled
                  title="Calendar integration handled by Katerina"
                  className="text-sm px-3 py-1 border rounded-md"
                >
                  Add to Calendar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
