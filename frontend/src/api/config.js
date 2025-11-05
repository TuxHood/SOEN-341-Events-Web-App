
//  backend teammates, update these endpoints when youre ready

// Default backend API base used when VITE_API_URL is not provided or appears to
// point at the frontend dev server (common misconfiguration).
const DEFAULT_API_BASE = 'http://127.0.0.1:8000/api';
const rawEnvApi = import.meta.env.VITE_API_URL;

// Defensive: if someone accidentally sets VITE_API_URL to the frontend dev
// server (ports 5173/5174) we fall back to the real backend default.
if (rawEnvApi && /:(5173|5174)\b/.test(rawEnvApi)) {
  // do not use the misconfigured value
  // eslint-disable-next-line no-console
  console.warn('VITE_API_URL appears to point at the frontend dev server; falling back to', DEFAULT_API_BASE);
}

const API_BASE_URL = (rawEnvApi && !/(:(5173|5174)\b)/.test(rawEnvApi)) ? rawEnvApi : DEFAULT_API_BASE;
// Backend endpoints. For local development we prefer a relative `/api` so Vite's
// dev server proxy (configured in vite.config.js) forwards requests to the
// Django backend. You can override with VITE_API_URL in environments where the
// backend runs on a different host/port.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {

  // Authentication endpoints

  register: `${API_BASE_URL}/users/register/`,
  login: `${API_BASE_URL}/users/login/`,
  
  // Events endpoints (for future use)

  events: `${API_BASE_URL}/events/`,
  
  // Tickets endpoints (for future use)

  tickets: `${API_BASE_URL}/tickets/`,
};

// Helper function for API calls

export async function apiCall(endpoint, options = {}) {
  try {
    // Always include credentials so httponly cookies set by the backend
    // (access token) are sent and received during auth flows.
    // Build request headers and include Authorization if we have a stored token
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    // Helper to read a cookie by name
    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }
    // For unsafe methods, ensure csrftoken exists and include X-CSRFToken header
    const method = (options.method || 'GET').toUpperCase();
    const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(method);
    if (unsafe) {
      let csrftoken = getCookie('csrftoken');
      // If no csrftoken present, call the dev helper to set it (with credentials)
      if (!csrftoken) {
        try {
          // call the backend helper to set csrftoken cookie via proxy
          await fetch('/api/csrf/', { method: 'GET', credentials: 'include' });
          csrftoken = getCookie('csrftoken');
        } catch (e) {
          // ignore — we'll continue and let the request fail with CSRF if necessary
        }
      }
      if (csrftoken && !reqHeaders['X-CSRFToken'] && !reqHeaders['X-CSRF-Token']) {
        reqHeaders['X-CSRFToken'] = csrftoken;
      }
    }
    try {
      const token = localStorage.getItem('access_token');
      if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      // ignore localStorage errors
    }

    const response = await fetch(endpoint, {
      credentials: 'include',
      headers: reqHeaders,
      ...options,
    });

    const data = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      ok: false,
      status: 0,
      data: { error: 'Network error. Please check your connection.' },
    };
  }
}