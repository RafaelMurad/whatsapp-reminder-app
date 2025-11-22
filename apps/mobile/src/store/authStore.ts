/**
 * Auth Store
 * Manages authentication state using Zustand
 */

import { create } from 'zustand';
import { api } from '../services/api';
import { User, LoginInput, RegisterInput } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check for stored token and user
      const storedUser = await api.getStoredUser();
      const hasToken = api.isAuthenticated();

      if (hasToken && storedUser) {
        // Verify token is still valid by fetching current user
        try {
          const user = await api.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Token expired or invalid, clear it
          await api.logout();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false, error: 'Failed to initialize auth' });
    }
  },

  login: async (input: LoginInput) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.login(input);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  register: async (input: RegisterInput) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.register(input);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
      set({ user: null, isAuthenticated: false, error: null });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
