/**
 * Location Hook
 * Provides location tracking and geofencing capabilities
 */

import { useEffect, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { locationService } from '../services';
import { useLocationStore } from '../store';
import { LocationUpdate } from '../types';

interface UseLocationOptions {
  enableBackgroundTracking?: boolean;
  enableGeofencing?: boolean;
  updateInterval?: number; // ms
}

export function useLocation(options: UseLocationOptions = {}) {
  const {
    enableBackgroundTracking = false,
    enableGeofencing = false,
    updateInterval = 60000, // 1 minute default
  } = options;

  const {
    currentLocation,
    geofences,
    locationPermission,
    backgroundPermission,
    isTracking,
    setCurrentLocation,
    fetchGeofences,
  } = useLocationStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize location services
  useEffect(() => {
    const initialize = async () => {
      await locationService.checkPermissions();
      await locationService.getCurrentLocation();
      setIsInitialized(true);
    };

    initialize();
  }, []);

  // Handle background tracking
  useEffect(() => {
    if (!isInitialized || !enableBackgroundTracking) return;

    if (backgroundPermission === 'granted') {
      locationService.startBackgroundTracking();
    }

    return () => {
      if (!enableBackgroundTracking) {
        locationService.stopBackgroundTracking();
      }
    };
  }, [isInitialized, enableBackgroundTracking, backgroundPermission]);

  // Handle geofencing
  useEffect(() => {
    if (!isInitialized || !enableGeofencing || geofences.length === 0) return;

    if (backgroundPermission === 'granted') {
      locationService.startGeofencing(geofences);
    }

    return () => {
      if (!enableGeofencing) {
        locationService.stopGeofencing();
      }
    };
  }, [isInitialized, enableGeofencing, geofences, backgroundPermission]);

  // Refresh location when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        await locationService.getCurrentLocation();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Request location permission
  const requestPermission = useCallback(async () => {
    const foreground = await locationService.requestForegroundPermission();
    if (foreground) {
      return locationService.requestBackgroundPermission();
    }
    return false;
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationUpdate | null> => {
    return locationService.getCurrentLocation();
  }, []);

  // Start tracking
  const startTracking = useCallback(async () => {
    const started = await locationService.startBackgroundTracking();
    if (started && geofences.length > 0) {
      await locationService.startGeofencing(geofences);
    }
    return started;
  }, [geofences]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    await locationService.stopBackgroundTracking();
    await locationService.stopGeofencing();
  }, []);

  // Check if inside a geofence
  const isInsideGeofence = useCallback(
    (geofenceId: string): boolean => {
      if (!currentLocation) return false;
      const geofence = geofences.find((g) => g.id === geofenceId);
      if (!geofence) return false;
      return locationService.isInsideGeofence(currentLocation, geofence);
    },
    [currentLocation, geofences]
  );

  // Get distance to geofence
  const getDistanceToGeofence = useCallback(
    (geofenceId: string): number | null => {
      if (!currentLocation) return null;
      const geofence = geofences.find((g) => g.id === geofenceId);
      if (!geofence) return null;
      return locationService.calculateDistanceToGeofence(currentLocation, geofence);
    },
    [currentLocation, geofences]
  );

  return {
    // State
    currentLocation,
    locationPermission,
    backgroundPermission,
    isTracking,
    isInitialized,
    hasPermission: locationPermission === 'granted',
    hasBackgroundPermission: backgroundPermission === 'granted',

    // Actions
    requestPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
    isInsideGeofence,
    getDistanceToGeofence,
    fetchGeofences,

    // Utilities
    formatDistance: locationService.formatDistance,
  };
}

export default useLocation;
