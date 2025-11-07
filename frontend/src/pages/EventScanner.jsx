import React from 'react'
import { useParams, Link } from 'react-router-dom'
import jsQR from 'jsqr'

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const api = (p) => `${BASE}${p.startsWith('/') ? '' : '/'}${p}`
const authHeaders = () => {
  const t = localStorage.getItem('access') || localStorage.getItem('access_token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export default function EventScanner(){
  const { eventId } = useParams()
  const [event, setEvent] = React.useState(null)
  const [error, setError] = React.useState(null)
  const videoRef = React.useRef(null)
  const canvasRef = React.useRef(null)
  const rafRef = React.useRef(null)
  const tracksRef = React.useRef([])
  const fileInputRef = React.useRef(null)
  const [scanning, setScanning] = React.useState(false)
  const [status, setStatus] = React.useState('')
  const [lastResult, setLastResult] = React.useState(null)

  React.useEffect(() => {
    let alive = true
    ;(async ()=>{
      try{
        const res = await fetch(api(`/events/${eventId}/`), { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
        if(!res.ok){
          // prefer a friendly error message; try to parse JSON {detail: '...'} first
          let msg = `Request failed with status ${res.status}`
          try{
            const err = await res.json()
            if(err && (err.detail || err.message)) msg = err.detail || err.message
            else msg = JSON.stringify(err)
          }catch(_){
            try{ msg = await res.text() }catch(__){}
          }
          if(alive) setError(msg)
          return
        }
        const data = await res.json()
        if(alive) setEvent(data)
      }catch(e){
        if(alive) setError(String(e?.message || e))
      }
    })()
    return ()=>{ alive = false }
  }, [eventId])

  // cleanup on unmount
  React.useEffect(()=>{
    return ()=>{
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopScanner = () => {
    setScanning(false)
    if(rafRef.current){ cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if(tracksRef.current && tracksRef.current.length){
      tracksRef.current.forEach(t=>{ try{ t.stop() }catch(_){} })
      tracksRef.current = []
    }
    try{ if(videoRef.current){ videoRef.current.pause(); videoRef.current.srcObject = null } }catch(_){ }
  }

  const startScanner = async () => {
    setError(null)
    setLastResult(null)
    setStatus('Starting camera…')
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      tracksRef.current = stream.getTracks()
      if(videoRef.current){
        videoRef.current.srcObject = stream
        // some browsers require play() after a small delay
        await videoRef.current.play()
      }
      setScanning(true)
      setStatus('Scanning for QR codes…')
      rafRef.current = requestAnimationFrame(tick)
    }catch(e){
      setError('Could not start camera: ' + String(e?.message || e))
      setStatus('')
    }
  }

  const tick = () => {
    if(!videoRef.current || videoRef.current.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA){
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    if(!canvas) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }
    const w = video.videoWidth
    const h = video.videoHeight
    if(w === 0 || h === 0){ rafRef.current = requestAnimationFrame(tick); return }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    const img = ctx.getImageData(0,0,w,h)
    try{
      const code = jsQR(img.data, w, h)
      if(code && code.data){
        // found a QR — pause scanning while we process
        stopScanner()
        handleDecoded(code.data)
        return
      }
    }catch(e){
      // decoding error — continue
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const handleFileChange = (e) => {
    setError(null)
    setLastResult(null)
    const f = e?.target?.files?.[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const img = new Image()
      img.onload = async () => {
        try{
          const canvas = canvasRef.current
          if(!canvas) return setError('Internal error: canvas missing')
          const ctx = canvas.getContext('2d')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          ctx.drawImage(img, 0, 0)
          const imgData = ctx.getImageData(0,0,canvas.width, canvas.height)
          const code = jsQR(imgData.data, canvas.width, canvas.height)
          if(code && code.data){
            handleDecoded(code.data)
          }else{
            setError('No QR code found in the uploaded image.')
          }
        }catch(err){
          setError('Failed to process image: ' + String(err?.message || err))
        }
      }
      img.onerror = () => setError('Failed to load image file')
      img.src = dataUrl
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsDataURL(f)
    // reset input so same file can be chosen again
    e.target.value = ''
  }

  const triggerFileSelect = () => {
    setError(null)
    setLastResult(null)
    if(fileInputRef.current) fileInputRef.current.click()
  }

  const extractTicketId = (s) => {
    if(!s) return null
    // try to find UUID
    const uuid = s.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)
    if(uuid) return uuid[0]
    // try /tickets/<id>
    const m = s.match(/tickets\/(?:qr\/)?([0-9a-fA-F\-]{6,})/i)
    if(m) return m[1]
    // fallback: if string looks like a numeric id
    const digits = s.match(/\d{4,}/)
    if(digits) return digits[0]
    return null
  }

  const handleDecoded = async (decoded) => {
    setStatus('QR detected — processing')
    setLastResult({ raw: decoded })
    const ticketId = extractTicketId(decoded)
    if(!ticketId){
      setError('Could not find a ticket id inside the scanned QR code.')
      setStatus('')
      return
    }

    setStatus(`Checking in ticket ${ticketId}…`)
    try{
      const res = await fetch(api(`/tickets/${ticketId}/checkin/`), { method: 'POST', headers: { 'Content-Type':'application/json', ...authHeaders() } })
      if(res.ok){
        const data = await res.json().catch(()=>null)
        setLastResult({ ticketId, success: true, detail: data || 'Checked in' })
        setStatus('Check-in successful')
        // Optimistically update checked-in count in UI
        setEvent(prev => prev ? { ...prev, tickets_checked_in: (prev.tickets_checked_in || 0) + 1 } : prev)
      }else{
        let msg = `Check-in failed (${res.status})`
        try{
          const j = await res.json()
          msg = j.detail || j.message || JSON.stringify(j)
        }catch(_){
          try{ msg = await res.text() }catch(__){}
        }
        setLastResult({ ticketId, success: false, detail: msg })
        setError(msg)
        setStatus('')
      }
    }catch(e){
      setError('Network error while checking in: ' + String(e?.message || e))
      setStatus('')
    }
  }

  if(error) return (
    <div style={{ padding: 24 }}>
      <div style={{ color: 'crimson', marginBottom: 8 }}>Error: {error}</div>
      <div><Link to="/organizer"><button style={{ padding: '8px 12px' }}>Back</button></Link></div>
    </div>
  )
  if(!event) return <div style={{ padding: 24 }}>Loading event…</div>

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0 }}>{event.title}</h1>
            <div style={{ color: '#6b7280' }}>{event.organization} — {event.start_time ? new Date(event.start_time).toLocaleString() : ''}</div>
          </div>
          <div>
            <Link to="/organizer" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}>Back</button>
            </Link>
          </div>
        </div>

        <div style={{ border: '1px dashed #e5e7eb', borderRadius: 8, padding: 20, textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: 6 }}>Scanner for this event</p>
          <p style={{ color: '#6b7280' }}>Point your camera at a ticket QR code. When a valid ticket is detected we'll call the check-in API for this ticket.</p>

          {typeof event.tickets_issued !== 'undefined' && (
            <div style={{ marginTop: 8, color: '#374151' }}>
              <strong>Tickets issued:</strong> {event.tickets_issued} · <strong>Checked-in:</strong> {event.tickets_checked_in || 0}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            {!scanning ? (
              <>
                <button onClick={startScanner} style={{ padding: '10px 14px', borderRadius: 6, background: '#111827', color: '#fff', border: 'none', marginRight: 8 }}>Start Scanner</button>
                <button onClick={()=>{ setLastResult(null); setError(null); setStatus('') }} style={{ padding: '10px 14px', borderRadius: 6, marginRight: 8 }}>Clear</button>
                <button onClick={triggerFileSelect} style={{ padding: '10px 14px', borderRadius: 6 }}>Upload QR image</button>
              </>
            ) : (
              <button onClick={stopScanner} style={{ padding: '10px 14px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none' }}>Stop Scanner</button>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ color: '#374151' }}>Status: {status || (scanning ? 'Scanning…' : 'Idle')}</div>
            {lastResult && (
              <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: lastResult.success ? '#dcfce7' : '#fee2e2', color: '#064e3b' }}>
                <div style={{ marginBottom: 6 }}>
                  {lastResult.success ? (
                    <>
                      <strong>Result:</strong>{' '}
                      {(() => {
                        const detail = lastResult.detail || {}
                        const name = detail.attendee_name || detail.name
                        return name ? `Checked in ${name}` : `Checked in ticket ${lastResult.ticketId}`
                      })()}
                    </>
                  ) : (
                    <><strong>Result:</strong> Error</>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* video + canvas for scanner (canvas hidden) */}
          <div style={{ marginTop: 12 }}>
            <video ref={videoRef} style={{ width: '100%', maxWidth: 640, borderRadius: 8 }} playsInline muted />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {/* hidden file input used by Upload QR image button */}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
