import { useApi } from '../hooks/useApi';
import { Event, ApiResponse } from '../types';

// Event service functions
export const eventService = {
  // Get all events
  getEvents: async (): Promise<ApiResponse<Event[]>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/events`);
    return response.json();
  },

  // Get event by ID
  getEventById: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/events/${id}`);
    return response.json();
  },

  // Create event
  createEvent: async (eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return response.json();
  },

  // Update event
  updateEvent: async (id: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return response.json();
  },

  // Delete event
  deleteEvent: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/events/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Search events
  searchEvents: async (query: string, filters?: {
    category?: string;
    city?: string;
    dateRange?: string;
    priceRange?: [number, number];
  }): Promise<ApiResponse<Event[]>> => {
    const params = new URLSearchParams({
      q: query,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.city && { city: filters.city }),
      ...(filters?.dateRange && { dateRange: filters.dateRange }),
      ...(filters?.priceRange && { 
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString()
      }),
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/events/search?${params}`);
    return response.json();
  },
};
