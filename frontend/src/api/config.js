
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
    // For unsafe methods, include X-CSRFToken header if cookie is present
    const method = (options.method || 'GET').toUpperCase();
    const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(method);
    if (unsafe) {
      const csrftoken = getCookie('csrftoken');
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