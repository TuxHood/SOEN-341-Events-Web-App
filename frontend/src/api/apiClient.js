import axios from 'axios';

// Minimal axios instance for the frontend to call the backend API.
// Prefer VITE_API_BASE_URL when set (useful if backend runs on a different port).
// For local dev we default to '/api' so the Vite dev server proxy (configured in vite.config.js)
// can forward requests to the Django backend.
const base = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: { 'Accept': 'application/json' },
});

// Attach Authorization header from localStorage if access token is present.
api.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem('access_token');
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore localStorage errors (e.g., in some privacy modes)
  }

  // Attach CSRF token for unsafe methods from cookie. If missing, attempt to
  // fetch it from the backend helper endpoint so the cookie is set first.
  try {
    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }
    const method = (config.method || 'get').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      let csrftoken = getCookie('csrftoken');
      if (!csrftoken) {
        try {
          // Use window.fetch directly to avoid interceptor recursion
          await fetch('/api/csrf/', { method: 'GET', credentials: 'include' });
          csrftoken = getCookie('csrftoken');
        } catch (e) {
          // ignore — proceed and let the request fail if CSRF required
        }
      }
      if (csrftoken && !config.headers['X-CSRFToken'] && !config.headers['X-CSRF-Token']) {
        config.headers['X-CSRFToken'] = csrftoken;
      }
    }
  } catch (err) {
    // ignore cookie/read errors
  }

  return config;
});

export default api;
