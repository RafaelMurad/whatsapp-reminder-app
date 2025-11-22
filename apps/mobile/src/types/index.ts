/**
 * Type Definitions
 * Matching the web app's data models
 */

// User types
export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  phoneNumber: string;
}

// Reminder types
export interface Reminder {
  id: string;
  userId: string;
  title: string;
  message: string;
  scheduledFor: string;
  sent: boolean;
  createdAt: string;
}

export interface CreateReminderInput {
  title: string;
  message: string;
  scheduledFor: string;
}

export interface UpdateReminderInput {
  id: string;
  title?: string;
  message?: string;
  scheduledFor?: string;
}

// Geofence/Location types (for location-based reminders)
export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  message: string;
  phoneNumber: string;
  triggerOn: 'enter' | 'exit' | 'both';
  enabled: boolean;
  lastTriggered?: string;
  cooldownMinutes: number;
}

export interface CreateGeofenceInput {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  message: string;
  phoneNumber: string;
  triggerOn: 'enter' | 'exit' | 'both';
  cooldownMinutes?: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp?: string;
  source?: 'webhook' | 'whatsapp_live' | 'manual' | 'native_app';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LocationResponse {
  success: boolean;
  location: LocationUpdate;
  triggeredGeofences: Array<{
    name: string;
    event: 'enter' | 'exit';
  }>;
}

// Feature flags
export interface FeatureFlags {
  [key: string]: boolean;
}
