import axios from 'axios';
import { refreshAccess } from './auth.js';

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
    // Support either key name saved by login/refresh logic
    const token = localStorage.getItem('access_token') || localStorage.getItem('access');
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
            // The CSRF helper lives under the users include: /api/users/csrf/
            await fetch(`${base}/users/csrf/`, { method: 'GET', credentials: 'include' });
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

// Response interceptor: on 401 try to refresh the access token and retry once.
api.interceptors.response.use(
  response => response,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);

    const status = error.response?.status;
    // Only attempt refresh once per request
    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newAccess = await refreshAccess();
        if (newAccess) {
          original.headers = original.headers || {};
          original.headers['Authorization'] = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch (e) {
        // Refresh failed: clear tokens and redirect to login to avoid surfacing raw token errors
        try {
          localStorage.removeItem('access');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh');
          localStorage.removeItem('refresh_token');
        } catch (_) {}
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
