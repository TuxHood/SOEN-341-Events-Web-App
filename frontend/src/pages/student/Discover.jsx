import { useEffect, useState } from "react";
import { EventsAPI } from "../../api/api";             // <- note the path
import EventCard from "../../components/EventCard";
import Spinner from "../../components/Spinner";

export default function Discover() {
  // make sure these are declared BEFORE you use them
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [org, setOrg] = useState("");
  const [dateAfter, setDateAfter] = useState("");
  const [dateBefore, setDateBefore] = useState("");

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [evRes, catRes, orgRes] = await Promise.all([
          EventsAPI.search({ q, category, org, date_after: dateAfter, date_before: dateBefore }),
          EventsAPI.categories().catch(() => ({ results: [] })),
          EventsAPI.orgs().catch(() => ({ results: [] })),
        ]);

        if (cancelled) return;
        setEvents((evRes?.results ?? evRes ?? []).filter(Boolean));
        setCategories(catRes?.results ?? catRes ?? []);
        setOrgs(orgRes?.results ?? orgRes ?? []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [q, category, org, dateAfter, dateBefore]);

  return (
    <div className="flex flex-col gap-6">
      <Filters
        q={q} setQ={setQ}
        category={category} setCategory={setCategory} categories={categories}
        org={org} setOrg={setOrg} orgs={orgs}
        dateAfter={dateAfter} setDateAfter={setDateAfter}
        dateBefore={dateBefore} setDateBefore={setDateBefore}
      />

      {loading ? <Spinner/> : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 && <div className="text-gray-500">No events match your filters.</div>}
          {events.map((evt) => (
            <EventCard key={evt.id} evt={evt}>
              <button disabled className="px-3 py-1 rounded-md border text-sm" title="Save/Unsave is Katerina’s feature">Save</button>
              <button disabled className="px-3 py-1 rounded-md border text-sm" title="Claim Ticket flow owned by Katerina">Claim Ticket</button>
              <a href={`/event/${evt.id}`} className="px-3 py-1 rounded-md border text-sm">Details</a>
            </EventCard>
          ))}
        </div>
      )}
    </div>
  );
}

function Filters({ q, setQ, category, setCategory, categories, org, setOrg, orgs, dateAfter, setDateAfter, dateBefore, setDateBefore }) {
  const catOpts = Array.isArray(categories) ? categories : [];
  const orgOpts = Array.isArray(orgs) ? orgs : [];
  return (
    <div className="rounded-xl border bg-white p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
      <div className="lg:col-span-2">
        <label className="text-xs text-gray-600">Search</label>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Title or description" className="mt-1 w-full border rounded-md px-3 py-2"/>
      </div>
      <div>
        <label className="text-xs text-gray-600">Category</label>
        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2">
          <option value="">All</option>
          {catOpts.map((c) => (
            <option key={(c.id ?? c)} value={(c.slug ?? c.value ?? c)}>{c.name ?? c.label ?? c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600">Organization</label>
        <select value={org} onChange={(e)=>setOrg(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2">
          <option value="">All</option>
          {orgOpts.map((o) => (
            <option key={(o.id ?? o)} value={(o.slug ?? o.value ?? o)}>{o.name ?? o.label ?? o}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:col-span-1">
        <div>
          <label className="text-xs text-gray-600">After</label>
          <input type="date" value={dateAfter} onChange={(e)=>setDateAfter(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2"/>
        </div>
        <div>
          <label className="text-xs text-gray-600">Before</label>
          <input type="date" value={dateBefore} onChange={(e)=>setDateBefore(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2"/>
        </div>
      </div>
    </div>
  );
}