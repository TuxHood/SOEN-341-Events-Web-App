import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { updateEvent, deleteEvent, rejectEvent } from '../api/events'

export default function AdminApprovals() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
  const [venueForm, setVenueForm] = useState({ name: '', address: '', capacity: '' })
  const [venues, setVenues] = useState([])

  // async function loadPending() {
  //   setLoading(true)
  //   setError(null)
  //   try {
  //     const res = await apiClient.get('/events/', { params: { is_approved: 'false' } })
  //     setEvents(res.data || [])
  //   } catch (e) {
  //     setError(e?.response?.data?.detail || e.message || 'Failed to load')
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  async function loadPending() {
  setLoading(true)
  setError(null)

  try {
    const res = await apiClient.get('/events/', {
      params: { is_approved: 'false' }
    })

    const allEvents = res.data || []

    // Only keep unapproved events WITH NO rejection reason
    const pending = allEvents.filter(ev => !ev.rejection_reason)

    setEvents(pending)
  } catch (e) {
    setError(e?.response?.data?.detail || e.message || 'Failed to load')
  } finally {
    setLoading(false)
  }
}


  async function loadVenues() {
    try {
      const r = await apiClient.get('/venues/')
      setVenues(r.data || [])
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => { loadPending(); loadVenues(); }, [])

  async function handleApprove(id) {
    try {
      await updateEvent(id, { is_approved: true })
      await loadPending()
      await loadVenues()
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    }
  }

  // async function handleReject(id) {
  //   if (!confirm('Delete this pending event? This cannot be undone.')) return
  //   try {
  //     await deleteEvent(id)
  //     await loadPending()
  //   } catch (e) {
  //     setError(e?.response?.data?.detail || e.message)
  //   }
  // }
  async function handleReject(id) {
    const reason = prompt('Please enter a reason for rejecting this event:')
    if (reason === null) {
      // Admin cancelled
      return
    }

    const trimmed = reason.trim()
    if (!trimmed) {
      alert('A rejection reason is required.')
      return
    }

    try {
      await rejectEvent(id, trimmed)   // ✅ now calls PATCH /events/:id/
      await loadPending()
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
      }
  }



  async function handleVenueSubmit(ev) {
    ev.preventDefault()
    setError(null)
    try {
      const payload = { name: venueForm.name, address: venueForm.address, capacity: Number(venueForm.capacity || 0) }
      await apiClient.post('/venues/', payload)
      setVenueForm({ name: '', address: '', capacity: '' })
      await loadVenues()
    } catch (e) {
      setError(e?.response?.data?.detail || e.message)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-3 text-sm">
        <Link to="/admin" className="text-indigo-600 hover:underline">← Return to Admin</Link>
      </div>
      <h2 className="text-2xl font-bold mb-4">Admin — Approve Organizer Events & Manage Venues</h2>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Pending Events</h3>
        {loading ? (
          <div>Loading pending events…</div>
        ) : events.length ? (
          <div className="space-y-4">
            {events.map(ev => (
              <div key={ev.id} className="rounded-md border p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-medium">{ev.title}</div>
                    <div className="text-sm text-gray-500">Organizer: {ev.organizer_name ?? ev.organizer}</div>
                    <div className="text-sm text-gray-500">When: {ev.start_time ? new Date(ev.start_time).toLocaleString() : '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(ev.id)} className="rounded bg-green-600 px-3 py-1 text-white">Approve</button>
                    <button onClick={() => handleReject(ev.id)} className="rounded bg-red-600 px-3 py-1 text-white">Reject</button>
                  </div>
                </div>
                {ev.description ? <div className="mt-2 text-sm text-gray-700">{ev.description}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No pending events.</div>
        )}
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Venues</h3>
        <form onSubmit={handleVenueSubmit} className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input required placeholder="Name" value={venueForm.name} onChange={e => setVenueForm(s => ({ ...s, name: e.target.value }))} className="p-2 border rounded" />
          <input required placeholder="Address" value={venueForm.address} onChange={e => setVenueForm(s => ({ ...s, address: e.target.value }))} className="p-2 border rounded" />
          <div className="flex gap-2">
            <input required placeholder="Capacity" type="number" min={0} value={venueForm.capacity} onChange={e => setVenueForm(s => ({ ...s, capacity: e.target.value }))} className="p-2 border rounded w-full" />
            <button className="rounded bg-indigo-600 px-3 py-1 text-white">Add</button>
          </div>
        </form>

        <div className="space-y-2">
          {venues.length ? venues.map(v => (
            <div key={v.id} className="rounded border p-3 bg-white">
              <div className="font-medium">{v.name} <span className="text-sm text-gray-500">(capacity: {v.capacity})</span></div>
              <div className="text-sm text-gray-500">{v.address}</div>
            </div>
          )) : <div className="text-gray-500">No venues yet.</div>}
        </div>
      </section>
    </div>
  )
}
