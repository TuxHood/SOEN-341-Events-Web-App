import { apiCall } from './config';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Analytics API Service
 * Handles all analytics-related API calls
 */

export const analyticsAPI = {
  /**
   * Get analytics data for a specific event
   * @param {number|string} eventId - The event ID
   * @returns {Promise} Analytics data including tickets, attendance, and capacity
   */
  getEventAnalytics: async (eventId) => {
    const endpoint = `${API_BASE_URL}/events/${eventId}/analytics/`;
    return await apiCall(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get analytics for all events (future enhancement)
   * @returns {Promise} Analytics data for all events
   */
  getAllEventsAnalytics: async () => {
    const endpoint = `${API_BASE_URL}/analytics/events/`;
    return await apiCall(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get analytics for events by organizer (future enhancement)
   * @param {number|string} organizerId - The organizer's user ID
   * @returns {Promise} Analytics data for organizer's events
   */
  getOrganizerAnalytics: async (organizerId) => {
    const endpoint = `${API_BASE_URL}/analytics/organizer/${organizerId}/`;
    return await apiCall(endpoint, {
      method: 'GET',
    });
  },
  getGlobalAnalytics: async () => {
  const endpoint = `${API_BASE_URL}/analytics/global/`;
  return await apiCall(endpoint, { method: 'GET' });
  },
};

export default analyticsAPI;
