import { useState, useEffect } from 'react';

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

// Generic API hook
export const useApi = <T>(endpoint: string, options?: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  immediate?: boolean;
}) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (overrideOptions?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: overrideOptions?.method || options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
          ...overrideOptions?.headers,
        },
        body: overrideOptions?.body || options?.body ? 
          JSON.stringify(overrideOptions?.body || options?.body) : 
          undefined,
      });

      const result: ApiResponse<T> = await response.json();

      if (result.success) {
        setData(result.data || null);
      } else {
        setError(result.error || 'Unknown error');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options?.immediate !== false) {
      execute();
    }
  }, [endpoint]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
};

// Specific hooks for common operations
export const useEvents = () => useApi<Event[]>('/api/events');

export const useCategories = () => useApi<Category[]>('/api/categories');

export const useCities = () => useApi<City[]>('/api/cities');

export const useVenues = () => useApi<Venue[]>('/api/venues');

export const useHealthCheck = () => useApi<any>('/api/health');
