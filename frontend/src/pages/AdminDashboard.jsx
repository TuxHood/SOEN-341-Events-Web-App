// import React from 'react'
// import { Link } from 'react-router-dom'

// export default function AdminDashboard() {
//   return (
//     <div style={{padding:20}}>
//       <h2>Admin Dashboard</h2>
//       <p>Platform overview and moderation tools (prototype).</p>
//       <ul>
//         <li>Total Events: 127</li>
//         <li>Total Attendance: 3,456</li>
//         <li>Pending Approvals: 8</li>
//         <li>Active Organizations: 23</li>
//       </ul>
//       <p><Link to="/">Back to Home</Link></p>
//     </div>
//   )
// }

import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI } from '../api/analytics'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  Legend
} from 'recharts'

function StatCard({ label, value, sublabel }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
      {sublabel ? <div className="mt-1 text-xs text-gray-400">{sublabel}</div> : null}
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
      <div className="text-lg font-medium">{title}</div>
      <div className="mt-1 text-sm">{description}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    (async () => {
      const res = await analyticsAPI.getGlobalAnalytics()
      if (res.ok) setData(res.data)
      else setError(res.data?.error || 'Failed to load analytics')
      setLoading(false)
    })()
  }, [])

  const trendData = useMemo(() => {
    if (!data?.trends_last_12_weeks?.length) return []
    // Ensure sorted by week_start just in case backend ordering shifts
    return [...data.trends_last_12_weeks]
      .filter(d => d.week_start) // guard nulls
      .sort((a, b) => a.week_start.localeCompare(b.week_start))
      .map(d => ({
        week: d.week_start.slice(5), // "MM-DD" for compact axis
        Tickets: d.tickets_issued ?? 0,
        'Check-ins': d.check_ins ?? 0,
      }))
  }, [data])

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-gray-500">Platform overview and moderation tools.</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      )}

      {data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Events" value={data.total_events ?? 0} />
            <StatCard label="Total Tickets Issued" value={data.total_tickets_issued ?? 0} />
            <StatCard label="Unique Attendees" value={data.unique_attendees ?? 0} />
          </div>

          {/* Trends */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Participation trends (last 12 weeks)</h3>
              {/* Slot for a future period selector */}
            </div>

            {trendData.length ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={24} />
                    <Line type="monotone" dataKey="Tickets" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Check-ins" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No recent activity"
                description="There’s no ticket activity in the last 12 weeks. Create events and issue tickets to see trends here."
              />
            )}
          </div>
        </>
      )}

      <div className="mt-6">
        <Link to="/" className="text-indigo-600 hover:underline">Back to Home</Link>
      </div>
    </div>
  )
}
