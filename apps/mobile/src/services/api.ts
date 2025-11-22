/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import * as SecureStore from 'expo-secure-store';
import {
  User,
  AuthResponse,
  LoginInput,
  RegisterInput,
  Reminder,
  CreateReminderInput,
  UpdateReminderInput,
  Geofence,
  CreateGeofenceInput,
  LocationUpdate,
  LocationResponse,
  FeatureFlags,
} from '../types';

// Configuration - update these for your environment
const CONFIG = {
  // Main API (tRPC endpoints)
  API_BASE_URL: __DEV__
    ? 'http://localhost:3000/api/trpc'
    : 'https://your-production-url.com/api/trpc',

  // Worker API (location/geofence endpoints)
  WORKER_BASE_URL: __DEV__
    ? 'http://localhost:3001'
    : 'https://your-worker-url.com',
};

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  // ==================== Token Management ====================

  private async loadToken(): Promise<void> {
    try {
      this.token = await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // ==================== HTTP Helpers ====================

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // tRPC-style request helper
  private async trpcMutate<TInput, TOutput>(
    procedure: string,
    input: TInput,
    authenticated: boolean = true
  ): Promise<TOutput> {
    const url = `${CONFIG.API_BASE_URL}/${procedure}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(authenticated),
      body: JSON.stringify({ json: input }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Request failed');
    }

    return data.result?.data?.json ?? data.result?.data ?? data;
  }

  private async trpcQuery<TOutput>(
    procedure: string,
    input?: Record<string, unknown>,
    authenticated: boolean = true
  ): Promise<TOutput> {
    let url = `${CONFIG.API_BASE_URL}/${procedure}`;

    if (input) {
      const params = new URLSearchParams({ input: JSON.stringify({ json: input }) });
      url += `?${params}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(authenticated),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Request failed');
    }

    return data.result?.data?.json ?? data.result?.data ?? data;
  }

  // Worker API request helper
  private async workerRequest<TOutput>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TOutput> {
    const url = `${CONFIG.WORKER_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Request failed: ${response.status}`);
    }

    return response.json();
  }

  // ==================== Auth Endpoints ====================

  async login(input: LoginInput): Promise<AuthResponse> {
    const result = await this.trpcMutate<LoginInput, AuthResponse>(
      'auth.login',
      input,
      false
    );

    await this.setToken(result.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

    return result;
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const result = await this.trpcMutate<RegisterInput, AuthResponse>(
      'auth.register',
      input,
      false
    );

    await this.setToken(result.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));

    return result;
  }

  async getCurrentUser(): Promise<User> {
    return this.trpcQuery<User>('auth.me');
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // ==================== Reminder Endpoints ====================

  async getReminders(): Promise<Reminder[]> {
    return this.trpcQuery<Reminder[]>('reminder.list');
  }

  async getReminderById(id: string): Promise<Reminder> {
    return this.trpcQuery<Reminder>('reminder.byId', { id });
  }

  async createReminder(input: CreateReminderInput): Promise<Reminder> {
    return this.trpcMutate<CreateReminderInput, Reminder>('reminder.create', input);
  }

  async updateReminder(input: UpdateReminderInput): Promise<Reminder> {
    return this.trpcMutate<UpdateReminderInput, Reminder>('reminder.update', input);
  }

  async deleteReminder(id: string): Promise<{ success: boolean }> {
    return this.trpcMutate<{ id: string }, { success: boolean }>('reminder.delete', { id });
  }

  // ==================== Location/Geofence Endpoints (Worker API) ====================

  async sendLocation(location: LocationUpdate): Promise<LocationResponse> {
    return this.workerRequest<LocationResponse>('/location', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async getGeofences(): Promise<Geofence[]> {
    const result = await this.workerRequest<{ geofences: Geofence[] }>('/geofences');
    return result.geofences;
  }

  async createGeofence(input: CreateGeofenceInput): Promise<Geofence> {
    const result = await this.workerRequest<{ success: boolean; geofence: Geofence }>(
      '/geofences',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
    return result.geofence;
  }

  async deleteGeofence(id: string): Promise<void> {
    await this.workerRequest(`/geofences/${id}`, {
      method: 'DELETE',
    });
  }

  async getWorkerStatus(): Promise<{
    whatsappConnected: boolean;
    lastLocation?: LocationUpdate;
    activeGeofences: number;
  }> {
    return this.workerRequest('/status');
  }

  // ==================== Feature Flags ====================

  async getFeatureFlags(): Promise<FeatureFlags> {
    return this.trpcQuery<FeatureFlags>('featureFlags.getAll', undefined, false);
  }
}

// Export singleton instance
export const api = new ApiService();

// Export configuration for customization
export { CONFIG as ApiConfig };
