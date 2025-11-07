import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const api = (p) => `${BASE}${p.startsWith('/') ? '' : '/'}${p}`
const authHeaders = () => {
	const t = localStorage.getItem('access') || localStorage.getItem('access_token')
	return t ? { Authorization: `Bearer ${t}` } : {}
}

function toLocalInput(dtStr) {
	if (!dtStr) return ''
	const d = new Date(dtStr)
	if (isNaN(d.getTime())) return ''
	const off = d.getTimezoneOffset()
	const local = new Date(d.getTime() - off * 60000)
	return local.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
}

export default function EventEdit(){
	const { eventId } = useParams()
	const navigate = useNavigate()
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState(null)
	const [saving, setSaving] = React.useState(false)
	const [event, setEvent] = React.useState(null)

	const [form, setForm] = React.useState({
		title: '',
		description: '',
		organization: '',
		category: '',
		start_time: '',
		end_time: '',
		image_url: '',
		price_cents: 0,
	})

	React.useEffect(()=>{
		let alive = true
		;(async()=>{
			setLoading(true)
			setError(null)
			try{
				const res = await fetch(api(`/events/${eventId}/`), { headers: { 'Content-Type':'application/json', ...authHeaders() } })
				if(!res.ok){
					let msg = `Request failed (${res.status})`
					try{ const j = await res.json(); msg = j.detail || j.message || JSON.stringify(j) }catch(_){ try{ msg = await res.text() }catch(__){} }
					if(alive){ setError(msg); setLoading(false) }
					return
				}
				const data = await res.json()
				if(!alive) return
				setEvent(data)
				setForm({
					title: data.title || '',
					description: data.description || '',
					organization: data.organization || '',
					category: data.category || '',
					start_time: toLocalInput(data.start_time),
					end_time: toLocalInput(data.end_time),
					image_url: data.image_url || '',
					price_cents: typeof data.price_cents === 'number' ? data.price_cents : parseInt(data.price_cents || '0', 10),
				})
				setLoading(false)
			}catch(e){ if(alive){ setError(String(e?.message || e)); setLoading(false) } }
		})()
		return ()=>{ alive = false }
	}, [eventId])

	const onChange = (e) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: name === 'price_cents' ? (value === '' ? '' : Number(value)) : value }))
	}

	const onSubmit = async (e) => {
		e.preventDefault()
		setSaving(true)
		setError(null)
		try{
			const payload = {
				title: form.title,
				description: form.description,
				organization: form.organization,
				category: form.category,
				start_time: form.start_time, // send as ISO-like string; DRF parses 'YYYY-MM-DDTHH:mm'
				end_time: form.end_time,
				image_url: form.image_url,
				price_cents: form.price_cents,
			}
			const res = await fetch(api(`/events/${eventId}/`), {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', ...authHeaders() },
				body: JSON.stringify(payload)
			})
			if(res.ok){
				// After saving, go back to the organizer dashboard
				navigate('/organizer')
			}else{
				let msg = `Save failed (${res.status})`
				try{ const j = await res.json(); msg = j.detail || j.message || JSON.stringify(j) }catch(_){ try{ msg = await res.text() }catch(__){} }
				setError(msg)
			}
		}catch(err){
			setError(String(err?.message || err))
		}finally{
			setSaving(false)
		}
	}

		if(loading) return <div className="max-w-3xl mx-auto px-4 py-6">Loading…</div>
		if(error) return (
			<div className="max-w-3xl mx-auto px-4 py-6">
				<div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800">
					<div className="font-semibold">Error</div>
					<div className="text-sm">{error}</div>
				</div>
				<Link to="/organizer" className="text-sm text-blue-600 hover:underline">Back</Link>
			</div>
		)

		const inputClass = "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
		const labelClass = "text-sm font-medium text-gray-800"
		const cardClass = "rounded-lg border border-gray-200 bg-white shadow-sm"

		return (
			<div className="max-w-3xl mx-auto px-4 py-6">
				{/* Header */}
				<div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-gray-100 bg-[var(--background)]/80 backdrop-blur">
					<div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
						<div>
							<h1 className="text-xl font-semibold tracking-tight">Edit event</h1>
							<p className="text-xs text-muted-foreground">Update details and publish-ready info</p>
						</div>
						<div className="flex items-center gap-2">
							<Link to="/organizer" className="btn btn-sm btn-outline">Cancel</Link>
							<button onClick={onSubmit} disabled={saving} className="btn btn-sm btn-primary" style={{ background: '#000', color: '#fff' }}>{saving ? 'Saving…' : 'Save changes'}</button>
						</div>
					</div>
				</div>

				{/* Approval badge */}
				{event && event.is_approved === false && (
					<div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
						<div className="text-sm">This event is <span className="font-semibold">pending admin approval</span> and may be hidden from public discovery until approved.</div>
					</div>
				)}

				{/* Card */}
				<div className={cardClass}>
					<div className="grid grid-cols-1 gap-6 p-6">
						{/* Title */}
						<div>
							<label className={labelClass}>Title</label>
							<input name="title" value={form.title} onChange={onChange} required className={inputClass} placeholder="Give your event a clear, compelling name" />
						</div>

						{/* Description */}
						<div>
							<label className={labelClass}>Description</label>
							<textarea name="description" value={form.description} onChange={onChange} rows={6} className={inputClass} placeholder="What should attendees know?" />
							<div className="mt-1 text-xs text-gray-500">Tip: include agenda, speakers, or what to bring.</div>
						</div>

						{/* Meta */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<label className={labelClass}>Organization</label>
								<input name="organization" value={form.organization} onChange={onChange} className={inputClass} placeholder="Host organization" />
							</div>
							<div>
								<label className={labelClass}>Category</label>
								<input name="category" value={form.category} onChange={onChange} className={inputClass} placeholder="e.g. Tech, Sports, Arts" />
							</div>
						</div>

						{/* Schedule */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div>
								<label className={labelClass}>Start time</label>
								<input type="datetime-local" name="start_time" value={form.start_time} onChange={onChange} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>End time</label>
								<input type="datetime-local" name="end_time" value={form.end_time} onChange={onChange} className={inputClass} />
							</div>
						</div>

						{/* Media */}
						<div>
							<label className={labelClass}>Image URL</label>
							<input type="url" name="image_url" value={form.image_url} onChange={onChange} className={inputClass} placeholder="https://…" />
							{form.image_url && (
								<div className="mt-3 overflow-hidden rounded-md border">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={form.image_url} alt="Event banner preview" className="h-48 w-full object-cover" onError={(e)=>{ e.currentTarget.style.display='none' }} />
								</div>
							)}
						</div>

						{/* Pricing */}
						<div>
							<label className={labelClass}>Price (cents)</label>
							<input type="number" name="price_cents" value={form.price_cents} onChange={onChange} min={0} className={inputClass} />
							<div className="mt-1 text-xs text-gray-500">Set 0 for free events.</div>
						</div>
					</div>

					{/* Footer actions */}
					<div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
						  <Link to="/organizer" className="btn btn-sm btn-outline">Cancel</Link>
						  <button onClick={onSubmit} disabled={saving} className="btn btn-sm btn-primary" style={{ background: '#000', color: '#fff' }}>{saving ? 'Saving…' : 'Save changes'}</button>
					</div>
				</div>
			</div>
		)
}

