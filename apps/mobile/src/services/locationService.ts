/**
 * Location Service
 * Native geofencing and background location tracking using Expo Location
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useLocationStore } from '../store';
import { api } from './api';
import { Geofence, LocationUpdate } from '../types';

// Task names for background location
const LOCATION_TASK_NAME = 'whatsapp-reminders-location-task';
const GEOFENCE_TASK_NAME = 'whatsapp-reminders-geofence-task';

// Haversine formula for distance calculation (in meters)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Define background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      const locationUpdate: LocationUpdate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(location.timestamp).toISOString(),
        source: 'native_app',
      };

      // Send to server for geofence processing
      try {
        await api.sendLocation(locationUpdate);
      } catch (error) {
        console.error('Failed to send location to server:', error);
      }
    }
  }
});

// Define geofence task
TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Geofence task error:', error);
    return;
  }

  if (data) {
    const { eventType, region } = data as {
      eventType: Location.GeofencingEventType;
      region: Location.LocationRegion;
    };

    const event = eventType === Location.GeofencingEventType.Enter ? 'enter' : 'exit';
    console.log(`Geofence ${event}: ${region.identifier}`);

    // Get current location for accuracy
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationUpdate: LocationUpdate = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: new Date().toISOString(),
        source: 'native_app',
      };

      // Send to server - it will handle the geofence trigger
      await api.sendLocation(locationUpdate);
    } catch (error) {
      console.error('Failed to process geofence event:', error);
    }
  }
});

class LocationService {
  private isInitialized = false;

  // ==================== Permission Management ====================

  async requestForegroundPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    useLocationStore.getState().setLocationPermission(granted ? 'granted' : 'denied');
    return granted;
  }

  async requestBackgroundPermission(): Promise<boolean> {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    const granted = status === 'granted';
    useLocationStore.getState().setBackgroundPermission(granted ? 'granted' : 'denied');
    return granted;
  }

  async checkPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
  }> {
    const foregroundStatus = await Location.getForegroundPermissionsAsync();
    const backgroundStatus = await Location.getBackgroundPermissionsAsync();

    const foreground = foregroundStatus.status === 'granted';
    const background = backgroundStatus.status === 'granted';

    useLocationStore.getState().setLocationPermission(foreground ? 'granted' : 'denied');
    useLocationStore.getState().setBackgroundPermission(background ? 'granted' : 'denied');

    return { foreground, background };
  }

  // ==================== Current Location ====================

  async getCurrentLocation(): Promise<LocationUpdate | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationUpdate: LocationUpdate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(location.timestamp).toISOString(),
      };

      useLocationStore.getState().setCurrentLocation(locationUpdate);

      return locationUpdate;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  // ==================== Background Location Tracking ====================

  async startBackgroundTracking(): Promise<boolean> {
    try {
      const { background } = await this.checkPermissions();

      if (!background) {
        const granted = await this.requestBackgroundPermission();
        if (!granted) {
          console.warn('Background location permission denied');
          return false;
        }
      }

      // Check if task is already running
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        console.log('Background location already running');
        return true;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // 1 minute
        distanceInterval: 100, // 100 meters
        deferredUpdatesInterval: 60000,
        deferredUpdatesDistance: 100,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'WhatsApp Reminders',
          notificationBody: 'Tracking location for reminders',
          notificationColor: '#3B82F6',
        },
      });

      useLocationStore.getState().setIsTracking(true);
      console.log('Background location tracking started');
      return true;
    } catch (error) {
      console.error('Failed to start background tracking:', error);
      return false;
    }
  }

  async stopBackgroundTracking(): Promise<void> {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      useLocationStore.getState().setIsTracking(false);
      console.log('Background location tracking stopped');
    } catch (error) {
      console.error('Failed to stop background tracking:', error);
    }
  }

  // ==================== Native Geofencing ====================

  async startGeofencing(geofences: Geofence[]): Promise<boolean> {
    try {
      const { background } = await this.checkPermissions();

      if (!background) {
        const granted = await this.requestBackgroundPermission();
        if (!granted) {
          console.warn('Background location permission denied');
          return false;
        }
      }

      // Stop existing geofencing first
      await this.stopGeofencing();

      if (geofences.length === 0) {
        console.log('No geofences to register');
        return true;
      }

      // Convert to Expo Location regions
      const regions: Location.LocationRegion[] = geofences
        .filter((g) => g.enabled)
        .map((g) => ({
          identifier: g.id,
          latitude: g.latitude,
          longitude: g.longitude,
          radius: g.radiusMeters,
          notifyOnEnter: g.triggerOn === 'enter' || g.triggerOn === 'both',
          notifyOnExit: g.triggerOn === 'exit' || g.triggerOn === 'both',
        }));

      if (regions.length === 0) {
        console.log('No enabled geofences to register');
        return true;
      }

      await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
      console.log(`Registered ${regions.length} geofences`);
      return true;
    } catch (error) {
      console.error('Failed to start geofencing:', error);
      return false;
    }
  }

  async stopGeofencing(): Promise<void> {
    try {
      const hasStarted = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK_NAME);
      if (hasStarted) {
        await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
      }
      console.log('Geofencing stopped');
    } catch (error) {
      console.error('Failed to stop geofencing:', error);
    }
  }

  // ==================== Local Geofence Checking ====================

  // Check geofences locally (for immediate feedback when app is in foreground)
  checkGeofencesLocally(
    location: LocationUpdate,
    geofences: Geofence[]
  ): Array<{ geofence: Geofence; event: 'enter' | 'exit' }> {
    const triggered: Array<{ geofence: Geofence; event: 'enter' | 'exit' }> = [];

    for (const geofence of geofences) {
      if (!geofence.enabled) continue;

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radiusMeters;

      // For simplicity, we just report if inside for 'enter' triggers
      // Server handles state transitions and cooldowns
      if (isInside && (geofence.triggerOn === 'enter' || geofence.triggerOn === 'both')) {
        triggered.push({ geofence, event: 'enter' });
      }
    }

    return triggered;
  }

  // ==================== Utility Methods ====================

  calculateDistanceToGeofence(
    location: LocationUpdate,
    geofence: Geofence
  ): number {
    return calculateDistance(
      location.latitude,
      location.longitude,
      geofence.latitude,
      geofence.longitude
    );
  }

  isInsideGeofence(location: LocationUpdate, geofence: Geofence): boolean {
    const distance = this.calculateDistanceToGeofence(location, geofence);
    return distance <= geofence.radiusMeters;
  }

  // Format distance for display
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

// Export singleton instance
export const locationService = new LocationService();
