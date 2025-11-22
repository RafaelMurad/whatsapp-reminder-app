// Location-Based Reminder Service
// Supports geofences and live location monitoring from WhatsApp

export interface Geofence {
  id: string
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
  message: string
  phoneNumber: string
  triggerOn: 'enter' | 'exit' | 'both'
  enabled: boolean
  lastTriggered?: Date
  cooldownMinutes: number // Prevent repeated triggers
}

export interface LocationUpdate {
  latitude: number
  longitude: number
  timestamp: Date
  source: 'webhook' | 'whatsapp_live' | 'manual'
}

// In-memory storage for geofences (could be moved to DB later)
const geofences: Map<string, Geofence> = new Map()
let lastKnownLocation: LocationUpdate | null = null
let wasInsideGeofence: Map<string, boolean> = new Map()

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Check if a point is inside a geofence
export function isInsideGeofence(
  lat: number,
  lon: number,
  geofence: Geofence
): boolean {
  const distance = calculateDistance(lat, lon, geofence.latitude, geofence.longitude)
  return distance <= geofence.radiusMeters
}

// Add or update a geofence
export function setGeofence(geofence: Geofence): void {
  geofences.set(geofence.id, geofence)
  console.log(`[Location] Geofence "${geofence.name}" set at ${geofence.latitude}, ${geofence.longitude} (${geofence.radiusMeters}m radius)`)
}

// Remove a geofence
export function removeGeofence(id: string): boolean {
  const deleted = geofences.delete(id)
  wasInsideGeofence.delete(id)
  if (deleted) {
    console.log(`[Location] Geofence ${id} removed`)
  }
  return deleted
}

// Get all geofences
export function getAllGeofences(): Geofence[] {
  return Array.from(geofences.values())
}

// Get a specific geofence
export function getGeofence(id: string): Geofence | undefined {
  return geofences.get(id)
}

// Process a location update and check geofences
export interface GeofenceTrigger {
  geofence: Geofence
  event: 'enter' | 'exit'
}

export function processLocationUpdate(
  location: LocationUpdate,
  sendMessage: (phone: string, message: string) => Promise<boolean>
): GeofenceTrigger[] {
  const triggers: GeofenceTrigger[] = []
  const now = new Date()

  lastKnownLocation = location
  console.log(`[Location] Update received: ${location.latitude}, ${location.longitude} (via ${location.source})`)

  for (const geofence of geofences.values()) {
    if (!geofence.enabled) continue

    const isInside = isInsideGeofence(location.latitude, location.longitude, geofence)
    const wasInside = wasInsideGeofence.get(geofence.id) ?? false

    // Check cooldown
    if (geofence.lastTriggered) {
      const cooldownMs = geofence.cooldownMinutes * 60 * 1000
      if (now.getTime() - geofence.lastTriggered.getTime() < cooldownMs) {
        continue // Still in cooldown
      }
    }

    let shouldTrigger = false
    let event: 'enter' | 'exit' | null = null

    // Detect enter/exit events
    if (isInside && !wasInside) {
      event = 'enter'
      if (geofence.triggerOn === 'enter' || geofence.triggerOn === 'both') {
        shouldTrigger = true
      }
    } else if (!isInside && wasInside) {
      event = 'exit'
      if (geofence.triggerOn === 'exit' || geofence.triggerOn === 'both') {
        shouldTrigger = true
      }
    }

    // Update state
    wasInsideGeofence.set(geofence.id, isInside)

    if (shouldTrigger && event) {
      console.log(`[Location] Geofence "${geofence.name}" triggered: ${event}`)
      triggers.push({ geofence, event })

      // Update last triggered time
      geofence.lastTriggered = now

      // Send the message
      const messagePrefix = event === 'enter' ? '📍 Arrived:' : '🚗 Left:'
      sendMessage(
        geofence.phoneNumber,
        `${messagePrefix} ${geofence.name}\n\n${geofence.message}`
      ).catch(err => console.error('[Location] Failed to send geofence message:', err))
    }
  }

  return triggers
}

// Get last known location
export function getLastLocation(): LocationUpdate | null {
  return lastKnownLocation
}

// Parse WhatsApp live location message
export function parseWhatsAppLocation(message: any): LocationUpdate | null {
  try {
    // whatsapp-web.js location message structure
    if (message.type === 'location' || message.location) {
      const loc = message.location || message
      return {
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: new Date(),
        source: 'whatsapp_live'
      }
    }
  } catch (error) {
    console.error('[Location] Failed to parse WhatsApp location:', error)
  }
  return null
}

// Export some common location presets
export const PRESET_LOCATIONS = {
  // User can add their own presets
  home: { name: 'Home', latitude: 0, longitude: 0 },
  work: { name: 'Work', latitude: 0, longitude: 0 },
  gym: { name: 'Gym', latitude: 0, longitude: 0 },
}

// Generate a unique ID for geofences
export function generateGeofenceId(): string {
  return `gf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
