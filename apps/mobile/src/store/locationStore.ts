/**
 * Location Store
 * Manages location-based reminders and geofencing state
 */

import { create } from 'zustand';
import { api } from '../services/api';
import { Geofence, CreateGeofenceInput, LocationUpdate } from '../types';

interface LocationState {
  geofences: Geofence[];
  currentLocation: LocationUpdate | null;
  isLoading: boolean;
  error: string | null;
  locationPermission: 'undetermined' | 'granted' | 'denied';
  backgroundPermission: 'undetermined' | 'granted' | 'denied';
  isTracking: boolean;

  // Actions
  fetchGeofences: () => Promise<void>;
  createGeofence: (input: CreateGeofenceInput) => Promise<Geofence>;
  deleteGeofence: (id: string) => Promise<void>;
  setCurrentLocation: (location: LocationUpdate) => void;
  sendLocationToServer: (location: LocationUpdate) => Promise<void>;
  setLocationPermission: (status: 'undetermined' | 'granted' | 'denied') => void;
  setBackgroundPermission: (status: 'undetermined' | 'granted' | 'denied') => void;
  setIsTracking: (isTracking: boolean) => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  geofences: [],
  currentLocation: null,
  isLoading: false,
  error: null,
  locationPermission: 'undetermined',
  backgroundPermission: 'undetermined',
  isTracking: false,

  fetchGeofences: async () => {
    try {
      set({ isLoading: true, error: null });

      const geofences = await api.getGeofences();

      set({ geofences, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch geofences',
      });
    }
  },

  createGeofence: async (input: CreateGeofenceInput) => {
    try {
      set({ isLoading: true, error: null });

      const newGeofence = await api.createGeofence(input);

      set((state) => ({
        geofences: [...state.geofences, newGeofence],
        isLoading: false,
      }));

      return newGeofence;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create geofence',
      });
      throw error;
    }
  },

  deleteGeofence: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await api.deleteGeofence(id);

      set((state) => ({
        geofences: state.geofences.filter((g) => g.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete geofence',
      });
      throw error;
    }
  },

  setCurrentLocation: (location: LocationUpdate) => {
    set({ currentLocation: location });
  },

  sendLocationToServer: async (location: LocationUpdate) => {
    try {
      const response = await api.sendLocation({
        ...location,
        source: 'native_app',
      });

      // Log triggered geofences if any
      if (response.triggeredGeofences && response.triggeredGeofences.length > 0) {
        console.log('Triggered geofences:', response.triggeredGeofences);
      }
    } catch (error) {
      console.error('Failed to send location to server:', error);
    }
  },

  setLocationPermission: (status) => set({ locationPermission: status }),
  setBackgroundPermission: (status) => set({ backgroundPermission: status }),
  setIsTracking: (isTracking) => set({ isTracking }),

  clearError: () => set({ error: null }),
}));

// Selector helpers
export const useActiveGeofences = () =>
  useLocationStore((state) => state.geofences.filter((g) => g.enabled));

export const useHasLocationPermission = () =>
  useLocationStore((state) => state.locationPermission === 'granted');

export const useHasBackgroundPermission = () =>
  useLocationStore((state) => state.backgroundPermission === 'granted');
