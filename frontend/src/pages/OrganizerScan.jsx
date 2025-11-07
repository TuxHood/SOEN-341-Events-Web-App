import React, {useEffect, useRef, useState} from 'react';
import api from '../api/apiClient';

export default function OrganizerScan(){
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('Ready to scan');
  const [detectorAvailable, setDetectorAvailable] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const streamRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(()=>{
    setDetectorAvailable(!!(window.BarcodeDetector));
  },[]);

  async function startCamera(){
    setMessage('Requesting camera...');
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if(videoRef.current){
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      setMessage('Scanning... point camera at QR code');
      runningRef.current = true;
      runLoop();
    }catch(e){
      console.error(e);
      setMessage('Camera error: ' + (e.message || e));
    }
  }

  function stopCamera(){
    runningRef.current = false;
    setScanning(false);
    setMessage('Stopped');
    if(streamRef.current){
      streamRef.current.getTracks().forEach(t=>t.stop());
      streamRef.current = null;
    }
    if(videoRef.current){
      try{ videoRef.current.pause(); videoRef.current.srcObject = null; }catch(e){}
    }
  }

  async function runLoop(){
    if(!runningRef.current) return;
    const video = videoRef.current;
    if(!video) return requestAnimationFrame(runLoop);

    try{
      if(window.BarcodeDetector){
        // prefer native BarcodeDetector
        const formats = ['qr_code'];
        const detector = new window.BarcodeDetector({formats});
        const barcodes = await detector.detect(video);
        if(barcodes && barcodes.length){
          handleDetected(barcodes[0].rawValue);
          return;
        }
      }else{
        // Fallback: draw to canvas and try decode via canvas.toDataURL and server-side? For now, show manual input fallback
      }
    }catch(e){
      // detection errors should not crash loop
      console.error('detect error', e);
    }

    requestAnimationFrame(runLoop);
  }

  async function handleDetected(value){
    if(!value) return;
    // Prevent duplicate rapid scans
    if(lastResult && lastResult.value === value && (Date.now() - lastResult.ts < 5000)){
      setMessage('Already scanned recently');
      return;
    }

    setLastResult({value, ts: Date.now()});
    setMessage('Detected: ' + value);
    // Try to extract a UUID from the value (many QR codes contain the ticket id directly)
    const ticketId = value.trim();

    // stop camera while checking
    stopCamera();
    setMessage('Verifying ticket...');

    try{
      const res = await api.post(`/tickets/${encodeURIComponent(ticketId)}/checkin/`);
      if(res && res.data){
        setMessage(res.data.detail || 'Checked in');
        setLastResult(prev=> ({...prev, result: res.data}));
      }else{
        setMessage('Check-in response received');
      }
    }catch(err){
      console.error(err);
      const text = err?.response?.data?.detail || err?.message || String(err);
      setMessage('Check-in failed: ' + text);
    }
  }

  async function handleManualSubmit(e){
    e.preventDefault();
    const v = e.target.elements['ticketId'].value.trim();
    if(!v) return;
    await handleDetected(v);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Organizer — Scan Tickets</h2>
      <p style={{ color: '#374151' }}>Use your device camera to scan attendee QR codes. If your browser doesn't support camera scanning, use the manual input below.</p>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ width: 420, height: 360, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden' }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
          {!detectorAvailable && (
            <div style={{ position: 'absolute', color: 'white', padding: 12, textAlign: 'center' }}>
              <div style={{ fontWeight: 700 }}>Browser scanning not supported</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>You can still enter ticket id manually below.</div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12 }}><strong>Status:</strong> {message}</div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {!scanning ? (
              <button onClick={startCamera} style={btnStyle}>Start Camera</button>
            ) : (
              <button onClick={stopCamera} style={btnStyleWarn}>Stop Camera</button>
            )}
            <button onClick={()=>{ setLastResult(null); setMessage('Ready to scan'); }} style={btnStyle}>Clear</button>
          </div>

          <form onSubmit={handleManualSubmit} style={{ marginTop: 8 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Manual Ticket ID</label>
            <input name="ticketId" placeholder="Paste ticket UUID or scan payload" style={{ padding: '10px 12px', width: '100%', borderRadius: 6, border: '1px solid #ddd' }} />
            <div style={{ marginTop: 8 }}>
              <button type="submit" style={btnStyle}>Check In</button>
            </div>
          </form>

          {lastResult && (
            <div style={{ marginTop: 16, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <div><strong>Last scan:</strong> {lastResult.value}</div>
              <div style={{ marginTop: 8 }}><strong>Result:</strong> {lastResult.result ? JSON.stringify(lastResult.result) : '—'}</div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

const btnStyle = { padding: '10px 14px', background: '#8B1538', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };
const btnStyleWarn = { padding: '10px 14px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };
