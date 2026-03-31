import { City, Venue, ApiResponse } from '../types';

// City service functions
export const cityService = {
  // Get all cities
  getCities: async (): Promise<ApiResponse<City[]>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/cities`);
    return response.json();
  },

  // Get city by ID
  getCityById: async (id: string): Promise<ApiResponse<City>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/cities/${id}`);
    return response.json();
  },
};

// Venue service functions
export const venueService = {
  // Get all venues
  getVenues: async (): Promise<ApiResponse<Venue[]>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/venues`);
    return response.json();
  },

  // Get venue by ID
  getVenueById: async (id: string): Promise<ApiResponse<Venue>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/venues/${id}`);
    return response.json();
  },

  // Get venues by city
  getVenuesByCity: async (cityId: string): Promise<ApiResponse<Venue[]>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/venues?cityId=${cityId}`);
    return response.json();
  },

  // Create venue (admin only)
  createVenue: async (venueData: Partial<Venue>): Promise<ApiResponse<Venue>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(venueData),
    });
    return response.json();
  },

  // Update venue (admin only)
  updateVenue: async (id: string, venueData: Partial<Venue>): Promise<ApiResponse<Venue>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/venues/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(venueData),
    });
    return response.json();
  },

  // Delete venue (admin only)
  deleteVenue: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/venues/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
