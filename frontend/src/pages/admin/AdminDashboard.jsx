import React, { useEffect, useMemo, useState } from "react";

/**
 * AdminDashboard.jsx
 * -------------------------------------------------------
 * A production-ready skeleton for the Administrator Dashboard.
 * - Clean Tailwind UI with sidebar navigation
 * - Four core modules: Overview (Analytics), Approvals, Moderation, Management
 * - Well-documented fetch helpers pointing to expected backend routes
 * - Drop-in ready for React Router (render at /admin)
 *
 * TODO: Replace mock state with live API calls (uncomment axios lines)
 * and wire to your Django REST endpoints shown in the comments below.
 * -------------------------------------------------------
 * Suggested Django REST endpoints
 *   GET    /api/admin/stats                      -> { eventsTotal, ticketsIssued, participants, trends: [{date, events, tickets}] }
 *   GET    /api/admin/organizers?status=pending  -> [ {id, name, email, org, submittedAt, notes} ]
 *   POST   /api/admin/organizers/{id}/approve    -> { ok: true }
 *   POST   /api/admin/organizers/{id}/reject     -> { ok: true, reason }
 *   GET    /api/admin/events/moderation?status=queued -> [ {id, title, org, category, flaggedBy, policyFlags:[...], submittedAt} ]
 *   POST   /api/admin/events/{id}/approve        -> { ok: true }
 *   POST   /api/admin/events/{id}/reject         -> { ok: true, reason }
 *   GET    /api/admin/orgs                       -> [ {id, name, members:[{id,name,email,role}]} ]
 *   PATCH  /api/admin/orgs/{id}                  -> update org
 *   POST   /api/admin/orgs/{id}/roles            -> assign role (admin/moderator/organizer)
 *   DELETE /api/admin/orgs/{id}/roles/{userId}   -> remove role
 * Security: Protect all routes with is_staff/is_superuser or a custom Admin role.
 */

// import axios from "axios"; // Uncomment when wiring real API

const NavButton = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-xl transition shadow-sm border
      ${isActive ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50 border-gray-200"}`}
  >
    <span className="text-lg">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow border border-gray-100">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-semibold mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Pill = ({ children }) => (
  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
    {children}
  </span>
);

const SectionTitle = ({ title, right }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold">{title}</h2>
    {right}
  </div>
);

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  // ---------- Mock state (replace with real API calls) ----------
  const [stats, setStats] = useState({
    eventsTotal: 128,
    ticketsIssued: 4237,
    participants: 3120,
    trends: [
      { date: "2025-10-01", events: 3, tickets: 120 },
      { date: "2025-10-08", events: 9, tickets: 540 },
      { date: "2025-10-15", events: 15, tickets: 980 },
      { date: "2025-10-22", events: 22, tickets: 1450 },
      { date: "2025-10-29", events: 18, tickets: 980 },
    ],
  });

  const [pendingOrganizers, setPendingOrganizers] = useState([
    { id: 11, name: "McGill Music Soc.", email: "lead@mgmusic.ca", org: "MG Music", submittedAt: "2025-10-28", notes: "Uploaded bylaws & exec list." },
    { id: 12, name: "Concordia E-Sports", email: "admin@cuex.ca", org: "CUEX", submittedAt: "2025-10-30", notes: "Need code of conduct link." },
  ]);

  const [moderationQueue, setModerationQueue] = useState([
    { id: 901, title: "Halloween Rave", org: "CUEX", category: "Party", flaggedBy: "auto-policy", policyFlags: ["Age-restriction missing", "Safety contact missing"], submittedAt: "2025-10-29" },
    { id: 902, title: "AI Ethics Panel", org: "SIG-CS", category: "Talk", flaggedBy: "user-report", policyFlags: ["Speaker bio unclear"], submittedAt: "2025-10-31" },
  ]);

  const [orgs, setOrgs] = useState([
    {
      id: 1,
      name: "CUEX",
      members: [
        { id: 101, name: "Rafik Shenouda", email: "rafik@cuex.ca", role: "organizer" },
        { id: 102, name: "Aris Moldovan", email: "aris@cuex.ca", role: "moderator" },
      ],
    },
    {
      id: 2,
      name: "MG Music",
      members: [
        { id: 103, name: "Katerina D'" + "Ambrosio", email: "kat@mgmusic.ca", role: "organizer" },
        { id: 104, name: "Ryan Malaeb", email: "ryan@mgmusic.ca", role: "viewer" },
      ],
    },
  ]);

  // ---------- Example fetch hooks (uncomment to wire live) ----------
  useEffect(() => {
    // (Example)
    // axios.get("/api/admin/stats").then(r => setStats(r.data));
    // axios.get("/api/admin/organizers", { params: { status: "pending" } }).then(r => setPendingOrganizers(r.data));
    // axios.get("/api/admin/events/moderation", { params: { status: "queued" } }).then(r => setModerationQueue(r.data));
    // axios.get("/api/admin/orgs").then(r => setOrgs(r.data));
  }, []);

  // ---------- Actions (with optimistic UI) ----------
  const approveOrganizer = async (id) => {
    setPendingOrganizers((prev) => prev.filter((o) => o.id !== id));
    try {
      // await axios.post(`/api/admin/organizers/${id}/approve`);
    } catch (e) {
      // rollback on error
      // refetch or reinsert as needed
    }
  };

  const rejectOrganizer = async (id) => {
    setPendingOrganizers((prev) => prev.filter((o) => o.id !== id));
    try {
      // await axios.post(`/api/admin/organizers/${id}/reject`, { reason: "Insufficient docs" });
    } catch (e) {
      // rollback if needed
    }
  };

  const approveEvent = async (id) => {
    setModerationQueue((prev) => prev.filter((e) => e.id !== id));
    try {
      // await axios.post(`/api/admin/events/${id}/approve`);
    } catch (e) {
      // rollback
    }
  };

  const rejectEvent = async (id) => {
    setModerationQueue((prev) => prev.filter((e) => e.id !== id));
    try {
      // await axios.post(`/api/admin/events/${id}/reject`, { reason: "Policy mismatch" });
    } catch (e) {
      // rollback
    }
  };

  const assignRole = async (orgId, userId, role) => {
    setOrgs((prev) => prev.map((o) => o.id === orgId ? {
      ...o,
      members: o.members.map(m => m.id === userId ? { ...m, role } : m)
    } : o));
    try {
      // await axios.post(`/api/admin/orgs/${orgId}/roles`, { userId, role });
    } catch (e) {
      // rollback
    }
  };

  const removeRole = async (orgId, userId) => {
    setOrgs((prev) => prev.map((o) => o.id === orgId ? {
      ...o,
      members: o.members.filter(m => m.id !== userId)
    } : o));
    try {
      // await axios.delete(`/api/admin/orgs/${orgId}/roles/${userId}`);
    } catch (e) {
      // rollback
    }
  };

  // ---------- Derived helpers ----------
  const trendSummary = useMemo(() => {
    const last = stats.trends.at(-1);
    const first = stats.trends[0];
    const growth = last && first ? Math.round(((last.tickets - first.tickets) / Math.max(1, first.tickets)) * 100) : 0;
    return `${growth >= 0 ? "+" : ""}${growth}% tickets vs. start of month`;
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-black text-white grid place-items-center font-bold">A</div>
            <div>
              <h1 className="text-lg font-semibold">Administrator Dashboard</h1>
              <p className="text-xs text-gray-500">Oversight • Analytics • Moderation • Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill>Admin</Pill>
            <button className="px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-50 text-sm">Settings</button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-3 space-y-2">
          <NavButton icon="📊" label="Overview" isActive={tab === "overview"} onClick={() => setTab("overview")} />
          <NavButton icon="✅" label="Approvals" isActive={tab === "approvals"} onClick={() => setTab("approvals")} />
          <NavButton icon="🛡️" label="Moderation" isActive={tab === "moderation"} onClick={() => setTab("moderation")} />
          <NavButton icon="🏢" label="Organizations & Roles" isActive={tab === "management"} onClick={() => setTab("management")} />
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9 lg:col-span-9 space-y-8">
          {tab === "overview" && (
            <section>
              <SectionTitle title="Platform Analytics" right={<Pill>{stats.trends.length} weeks</Pill>} />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Events" value={stats.eventsTotal} sub="Since semester start" />
                <StatCard title="Tickets Issued" value={stats.ticketsIssued} sub={trendSummary} />
                <StatCard title="Participants" value={stats.participants} sub="Unique accounts" />
                <StatCard title="Approval Queue" value={pendingOrganizers.length + moderationQueue.length} sub="Organizers + Events" />
              </div>

              {/* Simple inline trend (no charts lib required) */}
              <div className="mt-6 bg-white rounded-2xl p-5 shadow border border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Ticket Trend (last 5 weeks)</p>
                <div className="flex items-end gap-2 h-28">
                  {stats.trends.map((t) => (
                    <div key={t.date} className="flex-1">
                      <div
                        className="bg-black rounded-t-xl"
                        style={{ height: `${(t.tickets / (Math.max(...stats.trends.map(x => x.tickets)) || 1)) * 100}%` }}
                        title={`${t.date}: ${t.tickets} tickets`}
                      />
                      <p className="text-[10px] text-center mt-1 text-gray-400">{t.date.slice(5)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "approvals" && (
            <section>
              <SectionTitle title="Approve Organizer Accounts" right={<Pill>{pendingOrganizers.length} pending</Pill>} />
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Organization</th>
                      <th className="p-3 text-left">Submitted</th>
                      <th className="p-3 text-left">Notes</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrganizers.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="p-3 font-medium">{o.name}</td>
                        <td className="p-3 text-gray-700">{o.email}</td>
                        <td className="p-3">{o.org}</td>
                        <td className="p-3 text-gray-500">{o.submittedAt}</td>
                        <td className="p-3 text-gray-500">{o.notes}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => rejectOrganizer(o.id)} className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50">Reject</button>
                            <button onClick={() => approveOrganizer(o.id)} className="px-3 py-1.5 rounded-xl bg-black text-white">Approve</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingOrganizers.length === 0 && (
                      <tr>
                        <td className="p-6 text-center text-gray-500" colSpan={6}>No pending organizer applications. 🎉</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "moderation" && (
            <section>
              <SectionTitle title="Moderate Event Listings" right={<Pill>{moderationQueue.length} queued</Pill>} />
              <div className="bg-white rounded-2xl border border-gray-100 divide-y">
                {moderationQueue.map((e) => (
                  <div key={e.id} className="p-4 grid md:grid-cols-12 gap-3">
                    <div className="md:col-span-7">
                      <p className="text-sm text-gray-500">#{e.id}</p>
                      <h3 className="text-lg font-semibold">{e.title}</h3>
                      <p className="text-sm text-gray-600">{e.org} • {e.category}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {e.policyFlags.map((f, i) => <Pill key={i}>{f}</Pill>)}
                      </div>
                    </div>
                    <div className="md:col-span-3 text-sm text-gray-500">
                      <p>Flagged by: <span className="font-medium text-gray-700">{e.flaggedBy}</span></p>
                      <p>Submitted: {e.submittedAt}</p>
                    </div>
                    <div className="md:col-span-2 flex md:justify-end gap-2">
                      <button onClick={() => rejectEvent(e.id)} className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">Reject</button>
                      <button onClick={() => approveEvent(e.id)} className="px-3 py-2 rounded-xl bg-black text-white">Approve</button>
                    </div>
                  </div>
                ))}
                {moderationQueue.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No events awaiting review.</div>
                )}
              </div>
            </section>
          )}

          {tab === "management" && (
            <section>
              <SectionTitle title="Manage Organizations & Assign Roles" right={<Pill>{orgs.length} orgs</Pill>} />
              <div className="space-y-5">
                {orgs.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{o.name}</h3>
                        <p className="text-sm text-gray-500">{o.members.length} members</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm">Edit Org</button>
                        <button className="px-3 py-1.5 rounded-xl bg-black text-white text-sm">Add Member</button>
                      </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.members.map((m) => (
                            <tr key={m.id} className="border-t">
                              <td className="p-3 font-medium">{m.name}</td>
                              <td className="p-3 text-gray-700">{m.email}</td>
                              <td className="p-3">
                                <select
                                  className="px-2 py-1 border rounded-lg"
                                  value={m.role}
                                  onChange={(e) => assignRole(o.id, m.id, e.target.value)}
                                >
                                  <option value="admin">admin</option>
                                  <option value="moderator">moderator</option>
                                  <option value="organizer">organizer</option>
                                  <option value="viewer">viewer</option>
                                </select>
                              </td>
                              <td className="p-3 text-right">
                                <button onClick={() => removeRole(o.id, m.id)} className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50">Remove</button>
                              </td>
                            </tr>
                          ))}
                          {o.members.length === 0 && (
                            <tr>
                              <td className="p-6 text-center text-gray-500" colSpan={4}>No members yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
