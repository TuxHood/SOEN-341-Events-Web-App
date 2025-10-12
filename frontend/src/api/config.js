
//  backend teammates, update these endpoints when youre ready

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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