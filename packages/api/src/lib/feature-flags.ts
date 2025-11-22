/**
 * Feature Flags System
 *
 * A type-safe, modular feature flag system supporting:
 * - Boolean flags (on/off)
 * - Percentage rollouts (gradual releases)
 * - User-based targeting (specific users)
 * - Environment-based flags (dev/staging/prod)
 *
 * @module feature-flags
 */

import { z } from 'zod'

// =============================================================================
// TYPES & SCHEMAS
// =============================================================================

/**
 * Flag evaluation context - information about the current request
 */
export interface FlagContext {
  userId?: string
  email?: string
  environment: 'development' | 'staging' | 'production'
  timestamp: Date
}

/**
 * Base configuration for all flag types
 */
interface BaseFlagConfig {
  /** Human-readable description */
  description: string
  /** Category for organization */
  category: FlagCategory
  /** When this flag was added */
  addedAt: string
  /** Who owns this feature */
  owner?: string
}

/**
 * Boolean flag - simple on/off
 */
interface BooleanFlagConfig extends BaseFlagConfig {
  type: 'boolean'
  defaultValue: boolean
  /** Override per environment */
  environmentOverrides?: Partial<Record<FlagContext['environment'], boolean>>
}

/**
 * Percentage flag - gradual rollout
 */
interface PercentageFlagConfig extends BaseFlagConfig {
  type: 'percentage'
  /** Percentage of users (0-100) */
  percentage: number
  /** Seed for consistent hashing (same user always gets same result) */
  seed?: string
}

/**
 * User-targeted flag - specific users only
 */
interface UserTargetedFlagConfig extends BaseFlagConfig {
  type: 'user-targeted'
  /** List of user IDs or emails that have access */
  allowedUsers: string[]
  /** Fallback for non-targeted users */
  defaultValue: boolean
}

export type FlagConfig = BooleanFlagConfig | PercentageFlagConfig | UserTargetedFlagConfig

/**
 * Categories for organizing flags
 */
export type FlagCategory =
  | 'infrastructure'  // Core system features
  | 'ux'              // User experience improvements
  | 'backend'         // Server-side features
  | 'frontend'        // Client-side features
  | 'experimental'    // Beta/experimental features

// =============================================================================
// FEATURE FLAGS REGISTRY
// =============================================================================

/**
 * All feature flags for the application
 *
 * NAMING CONVENTION: use-kebab-case
 * - Prefix with feature area: 'realtime-', 'ui-', 'api-'
 * - Be descriptive: 'realtime-websocket-updates' not 'ws'
 */
export const FEATURE_FLAGS = {
  // -------------------------------------------------------------------------
  // TIER 1: Must-Have Interview Showstoppers
  // -------------------------------------------------------------------------

  'realtime-websocket-updates': {
    type: 'boolean',
    description: 'Enable real-time updates via WebSocket connections',
    category: 'infrastructure',
    defaultValue: false,
    addedAt: '2024-01-01',
    environmentOverrides: {
      development: true,
      staging: true,
      production: false,
    },
  },

  'ui-optimistic-updates': {
    type: 'boolean',
    description: 'Enable optimistic UI updates for better perceived performance',
    category: 'ux',
    defaultValue: false,
    addedAt: '2024-01-01',
    environmentOverrides: {
      development: true,
    },
  },

  'api-rate-limiting': {
    type: 'boolean',
    description: 'Enable API rate limiting and throttling',
    category: 'backend',
    defaultValue: false,
    addedAt: '2024-01-01',
    environmentOverrides: {
      production: true,
    },
  },

  'background-jobs-queue': {
    type: 'boolean',
    description: 'Enable background job processing queue',
    category: 'infrastructure',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  // -------------------------------------------------------------------------
  // TIER 2: Impressive Technical Depth
  // -------------------------------------------------------------------------

  'pwa-offline-mode': {
    type: 'boolean',
    description: 'Enable Progressive Web App with offline support',
    category: 'frontend',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  'analytics-dashboard': {
    type: 'boolean',
    description: 'Enable analytics dashboard with charts and metrics',
    category: 'frontend',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  'undo-redo-system': {
    type: 'boolean',
    description: 'Enable undo/redo functionality using Command pattern',
    category: 'ux',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  'keyboard-shortcuts': {
    type: 'boolean',
    description: 'Enable keyboard shortcuts and command palette (Cmd+K)',
    category: 'ux',
    defaultValue: false,
    addedAt: '2024-01-01',
    environmentOverrides: {
      development: true,
    },
  },

  // -------------------------------------------------------------------------
  // TIER 3: Modern Product Features
  // -------------------------------------------------------------------------

  'smart-notifications': {
    type: 'boolean',
    description: 'Enable smart browser push notifications',
    category: 'frontend',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  'dark-mode-theme': {
    type: 'boolean',
    description: 'Enable dark mode and theme switching',
    category: 'ux',
    defaultValue: false,
    addedAt: '2024-01-01',
    environmentOverrides: {
      development: true,
    },
  },

  'reminder-templates': {
    type: 'boolean',
    description: 'Enable pre-defined reminder templates',
    category: 'frontend',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  'search-fuzzy-matching': {
    type: 'boolean',
    description: 'Enable fuzzy search for reminders',
    category: 'frontend',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  // -------------------------------------------------------------------------
  // TIER 4: Advanced Patterns
  // -------------------------------------------------------------------------

  'multi-tenant-workspaces': {
    type: 'boolean',
    description: 'Enable multi-tenant workspace architecture',
    category: 'infrastructure',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  'activity-audit-log': {
    type: 'boolean',
    description: 'Enable activity feed and audit logging',
    category: 'backend',
    defaultValue: false,
    addedAt: '2024-01-01',
  },

  'ab-testing-framework': {
    type: 'percentage',
    description: 'Enable A/B testing framework',
    category: 'infrastructure',
    percentage: 0,
    seed: 'ab-testing-v1',
    addedAt: '2024-01-01',
  },

  'api-versioning': {
    type: 'boolean',
    description: 'Enable API versioning support',
    category: 'backend',
    defaultValue: false,
    addedAt: '2024-01-01',
  },
} as const satisfies Record<string, FlagConfig>

// Type-safe flag names
export type FeatureFlagName = keyof typeof FEATURE_FLAGS

// =============================================================================
// FLAG EVALUATION ENGINE
// =============================================================================

/**
 * Deterministic hash function for percentage rollouts
 * Ensures the same user always gets the same result
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Check if a user falls within a percentage rollout
 */
function isInPercentage(userId: string, percentage: number, seed: string = ''): boolean {
  const hash = hashString(`${seed}:${userId}`)
  const bucket = hash % 100
  return bucket < percentage
}

/**
 * Get current environment
 */
export function getCurrentEnvironment(): FlagContext['environment'] {
  const env = process.env.NODE_ENV
  if (env === 'production') return 'production'
  if (env === 'test' || process.env.STAGING === 'true') return 'staging'
  return 'development'
}

/**
 * Evaluate a single feature flag
 *
 * @param flagName - The flag to evaluate
 * @param context - Optional context for user-based or percentage flags
 * @returns Whether the flag is enabled
 *
 * @example
 * ```ts
 * // Simple check
 * if (isFeatureEnabled('dark-mode-theme')) {
 *   // Render dark mode UI
 * }
 *
 * // With user context for percentage rollouts
 * if (isFeatureEnabled('ab-testing-framework', { userId: 'user-123' })) {
 *   // User is in the test group
 * }
 * ```
 */
export function isFeatureEnabled(
  flagName: FeatureFlagName,
  context?: Partial<FlagContext>
): boolean {
  const flag = FEATURE_FLAGS[flagName]
  const env = context?.environment ?? getCurrentEnvironment()

  if (flag.type === 'boolean') {
    // Check environment override first
    const overrides = 'environmentOverrides' in flag
      ? (flag.environmentOverrides as Partial<Record<FlagContext['environment'], boolean>> | undefined)
      : undefined
    if (overrides && env in overrides && overrides[env] !== undefined) {
      return overrides[env]!
    }
    return flag.defaultValue
  }

  if (flag.type === 'percentage') {
    // Need a user ID for percentage rollouts
    if (!context?.userId) {
      return false // Default to off if no user context
    }
    return isInPercentage(context.userId, flag.percentage, flag.seed)
  }

  // Handle user-targeted type if added in the future
  if ('allowedUsers' in flag) {
    const targetedFlag = flag as UserTargetedFlagConfig
    if (context?.userId && targetedFlag.allowedUsers.includes(context.userId)) {
      return true
    }
    if (context?.email && targetedFlag.allowedUsers.includes(context.email)) {
      return true
    }
    return targetedFlag.defaultValue
  }

  return false
}

/**
 * Get all feature flags with their current values
 * Useful for sending to the client or debugging
 */
export function getAllFlags(context?: Partial<FlagContext>): Record<FeatureFlagName, boolean> {
  const flags = {} as Record<FeatureFlagName, boolean>

  for (const flagName of Object.keys(FEATURE_FLAGS) as FeatureFlagName[]) {
    flags[flagName] = isFeatureEnabled(flagName, context)
  }

  return flags
}

/**
 * Get flag metadata (for admin UI or debugging)
 */
export function getFlagMetadata(flagName: FeatureFlagName) {
  const flag = FEATURE_FLAGS[flagName]
  return {
    name: flagName,
    ...flag,
    currentValue: isFeatureEnabled(flagName),
  }
}

/**
 * Get all flags grouped by category
 */
export function getFlagsByCategory(): Record<FlagCategory, FeatureFlagName[]> {
  const grouped: Record<FlagCategory, FeatureFlagName[]> = {
    infrastructure: [],
    ux: [],
    backend: [],
    frontend: [],
    experimental: [],
  }

  for (const [name, config] of Object.entries(FEATURE_FLAGS)) {
    grouped[config.category].push(name as FeatureFlagName)
  }

  return grouped
}

// =============================================================================
// ZOD SCHEMAS FOR API VALIDATION
// =============================================================================

export const flagNameSchema = z.enum(
  Object.keys(FEATURE_FLAGS) as [FeatureFlagName, ...FeatureFlagName[]]
)

export const flagContextSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
})
