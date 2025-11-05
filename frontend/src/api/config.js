
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
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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