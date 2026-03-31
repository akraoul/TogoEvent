import { useState, useEffect } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'organizer' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth hook
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('togoevents-user');
    const savedToken = localStorage.getItem('togoevents-token');
    
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isAuthenticated: !!savedToken,
      isLoading: false,
      error: null,
    };
  });

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'user@example.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          isVerified: true,
          createdAt: new Date().toISOString(),
        };

        const mockToken = 'mock-jwt-token';
        
        localStorage.setItem('togoevents-user', JSON.stringify(mockUser));
        localStorage.setItem('togoevents-token', mockToken);
        
        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('togoevents-user');
    localStorage.removeItem('togoevents-token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Mock registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: 'user',
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      const mockToken = 'mock-jwt-token';
      
      localStorage.setItem('togoevents-user', JSON.stringify(mockUser));
      localStorage.setItem('togoevents-token', mockToken);
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    login,
    logout,
    register,
  };
};
