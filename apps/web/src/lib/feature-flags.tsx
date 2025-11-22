/**
 * Feature Flags Client
 *
 * SolidJS context and components for feature flag management.
 * Provides reactive access to feature flags throughout the app.
 *
 * @module lib/feature-flags
 *
 * LEARNING CONCEPTS:
 * - SolidJS Context API for global state
 * - Reactive primitives (createSignal, createResource)
 * - Component composition patterns
 * - Type-safe feature toggling
 */

import {
  createContext,
  useContext,
  createSignal,
  createResource,
  createEffect,
  type JSX,
  type ParentComponent,
  Show,
  For,
} from 'solid-js'
import { trpc } from './trpc'

// =============================================================================
// TYPES
// =============================================================================

/**
 * All available feature flag names
 * This type is derived from the server-side FEATURE_FLAGS constant
 */
export type FeatureFlagName =
  | 'realtime-websocket-updates'
  | 'ui-optimistic-updates'
  | 'api-rate-limiting'
  | 'background-jobs-queue'
  | 'pwa-offline-mode'
  | 'analytics-dashboard'
  | 'undo-redo-system'
  | 'keyboard-shortcuts'
  | 'smart-notifications'
  | 'dark-mode-theme'
  | 'reminder-templates'
  | 'search-fuzzy-matching'
  | 'multi-tenant-workspaces'
  | 'activity-audit-log'
  | 'ab-testing-framework'
  | 'api-versioning'

type FlagValues = Record<FeatureFlagName, boolean>

interface FeatureFlagsContextValue {
  /** All flag values (reactive) */
  flags: () => FlagValues | undefined
  /** Check if a specific flag is enabled */
  isEnabled: (flagName: FeatureFlagName) => boolean
  /** Loading state */
  isLoading: () => boolean
  /** Error state */
  error: () => Error | undefined
  /** Refetch flags from server */
  refetch: () => void
  /** Override a flag locally (for testing/development) */
  setLocalOverride: (flagName: FeatureFlagName, value: boolean | null) => void
  /** Get all local overrides */
  getLocalOverrides: () => Partial<FlagValues>
  /** Clear all local overrides */
  clearLocalOverrides: () => void
}

// =============================================================================
// CONTEXT
// =============================================================================

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>()

// Storage key for local overrides
const LOCAL_OVERRIDES_KEY = 'feature_flag_overrides'

/**
 * Load local overrides from localStorage
 */
function loadLocalOverrides(): Partial<FlagValues> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(LOCAL_OVERRIDES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Save local overrides to localStorage
 */
function saveLocalOverrides(overrides: Partial<FlagValues>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_OVERRIDES_KEY, JSON.stringify(overrides))
}

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * Feature Flags Provider
 *
 * Wrap your app with this provider to enable feature flag access
 * throughout the component tree.
 *
 * @example
 * ```tsx
 * // In app.tsx or root layout
 * <FeatureFlagsProvider>
 *   <App />
 * </FeatureFlagsProvider>
 * ```
 */
export const FeatureFlagsProvider: ParentComponent = (props) => {
  // Local overrides (for development/testing)
  const [localOverrides, setLocalOverridesState] = createSignal<Partial<FlagValues>>(
    loadLocalOverrides()
  )

  // Fetch flags from server
  const [serverFlags, { refetch }] = createResource(async () => {
    try {
      const flags = await trpc.featureFlags.getAll.query()
      return flags as FlagValues
    } catch (error) {
      console.error('Failed to fetch feature flags:', error)
      throw error
    }
  })

  // Persist local overrides when they change
  createEffect(() => {
    saveLocalOverrides(localOverrides())
  })

  // Combine server flags with local overrides
  const flags = () => {
    const server = serverFlags()
    if (!server) return undefined
    return { ...server, ...localOverrides() }
  }

  const isEnabled = (flagName: FeatureFlagName): boolean => {
    // Check local override first
    const override = localOverrides()[flagName]
    if (override !== undefined) return override

    // Fall back to server value
    const server = serverFlags()
    if (!server) return false
    return server[flagName] ?? false
  }

  const setLocalOverride = (flagName: FeatureFlagName, value: boolean | null) => {
    setLocalOverridesState((prev) => {
      const next = { ...prev }
      if (value === null) {
        delete next[flagName]
      } else {
        next[flagName] = value
      }
      return next
    })
  }

  const clearLocalOverrides = () => {
    setLocalOverridesState({})
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_OVERRIDES_KEY)
    }
  }

  const value: FeatureFlagsContextValue = {
    flags,
    isEnabled,
    isLoading: () => serverFlags.loading,
    error: () => serverFlags.error,
    refetch,
    setLocalOverride,
    getLocalOverrides: localOverrides,
    clearLocalOverrides,
  }

  return (
    <FeatureFlagsContext.Provider value={value}>
      {props.children}
    </FeatureFlagsContext.Provider>
  )
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Access feature flags context
 *
 * @throws Error if used outside of FeatureFlagsProvider
 *
 * @example
 * ```tsx
 * const { isEnabled, flags } = useFeatureFlags()
 *
 * return (
 *   <div>
 *     {isEnabled('dark-mode-theme') && <DarkModeToggle />}
 *   </div>
 * )
 * ```
 */
export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext)
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider')
  }
  return context
}

/**
 * Check if a single flag is enabled (convenience hook)
 *
 * @param flagName - The flag to check
 * @returns Whether the flag is enabled
 *
 * @example
 * ```tsx
 * const isDarkModeEnabled = useFeatureFlag('dark-mode-theme')
 *
 * return (
 *   <div class={isDarkModeEnabled() ? 'dark' : 'light'}>
 *     Content
 *   </div>
 * )
 * ```
 */
export function useFeatureFlag(flagName: FeatureFlagName): () => boolean {
  const { isEnabled } = useFeatureFlags()
  return () => isEnabled(flagName)
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface FeatureGateProps {
  /** The flag to check */
  flag: FeatureFlagName
  /** Content to show when flag is enabled */
  children: JSX.Element
  /** Optional content to show when flag is disabled */
  fallback?: JSX.Element
  /** Show loading state while flags are being fetched */
  showLoading?: boolean
}

/**
 * Conditionally render content based on a feature flag
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FeatureGate flag="dark-mode-theme">
 *   <DarkModeToggle />
 * </FeatureGate>
 *
 * // With fallback
 * <FeatureGate
 *   flag="analytics-dashboard"
 *   fallback={<p>Analytics coming soon!</p>}
 * >
 *   <AnalyticsDashboard />
 * </FeatureGate>
 * ```
 */
export function FeatureGate(props: FeatureGateProps): JSX.Element {
  const { isEnabled, isLoading } = useFeatureFlags()

  return (
    <Show
      when={!isLoading() || !props.showLoading}
      fallback={props.showLoading ? <div>Loading...</div> : null}
    >
      <Show when={isEnabled(props.flag)} fallback={props.fallback}>
        {props.children}
      </Show>
    </Show>
  )
}

interface FeatureGateMultipleProps {
  /** Flags to check - ALL must be enabled */
  flags: FeatureFlagName[]
  /** How to combine flags: 'all' (AND) or 'any' (OR) */
  mode?: 'all' | 'any'
  children: JSX.Element
  fallback?: JSX.Element
}

/**
 * Gate content behind multiple feature flags
 *
 * @example
 * ```tsx
 * // All flags must be enabled (AND)
 * <FeatureGateMultiple flags={['realtime-websocket-updates', 'smart-notifications']}>
 *   <RealtimeNotifications />
 * </FeatureGateMultiple>
 *
 * // Any flag can be enabled (OR)
 * <FeatureGateMultiple flags={['pwa-offline-mode', 'smart-notifications']} mode="any">
 *   <NotificationBanner />
 * </FeatureGateMultiple>
 * ```
 */
export function FeatureGateMultiple(props: FeatureGateMultipleProps): JSX.Element {
  const { isEnabled } = useFeatureFlags()
  const mode = props.mode ?? 'all'

  const isAllowed = () => {
    if (mode === 'all') {
      return props.flags.every((flag) => isEnabled(flag))
    }
    return props.flags.some((flag) => isEnabled(flag))
  }

  return (
    <Show when={isAllowed()} fallback={props.fallback}>
      {props.children}
    </Show>
  )
}

// =============================================================================
// DEVELOPMENT TOOLS
// =============================================================================

/**
 * Feature Flags Debug Panel
 *
 * A development tool to view and override feature flags.
 * Only render this in development mode!
 *
 * @example
 * ```tsx
 * // In your app root
 * {import.meta.env.DEV && <FeatureFlagsDebugPanel />}
 * ```
 */
export function FeatureFlagsDebugPanel(): JSX.Element {
  const { flags, isEnabled, setLocalOverride, getLocalOverrides, clearLocalOverrides, refetch } =
    useFeatureFlags()
  const [isOpen, setIsOpen] = createSignal(false)

  const allFlags = flags()
  const overrides = getLocalOverrides()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        'z-index': '9999',
        'font-family': 'monospace',
        'font-size': '12px',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen())}
        style={{
          background: '#6366f1',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          'border-radius': '8px',
          cursor: 'pointer',
          'font-weight': 'bold',
        }}
      >
        {isOpen() ? 'Close' : 'Feature Flags'}
      </button>

      <Show when={isOpen()}>
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '0',
            background: 'white',
            border: '1px solid #e5e7eb',
            'border-radius': '8px',
            'box-shadow': '0 4px 6px rgba(0,0,0,0.1)',
            padding: '16px',
            width: '320px',
            'max-height': '400px',
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'flex', 'justify-content': 'space-between', 'margin-bottom': '12px' }}>
            <strong>Feature Flags</strong>
            <div>
              <button
                onClick={() => refetch()}
                style={{
                  background: '#e5e7eb',
                  border: 'none',
                  padding: '4px 8px',
                  'border-radius': '4px',
                  cursor: 'pointer',
                  'margin-right': '4px',
                }}
              >
                Refresh
              </button>
              <button
                onClick={() => clearLocalOverrides()}
                style={{
                  background: '#fecaca',
                  border: 'none',
                  padding: '4px 8px',
                  'border-radius': '4px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <Show when={allFlags} fallback={<p>Loading flags...</p>}>
            {(flagsData) => (
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
                <For each={Object.keys(flagsData())}>
                  {(name) => {
                    const hasOverride = () => name in overrides
                    return (
                      <div
                        style={{
                          display: 'flex',
                          'justify-content': 'space-between',
                          'align-items': 'center',
                          padding: '4px 8px',
                          background: hasOverride() ? '#fef3c7' : '#f9fafb',
                          'border-radius': '4px',
                        }}
                      >
                        <span
                          style={{
                            'max-width': '200px',
                            overflow: 'hidden',
                            'text-overflow': 'ellipsis',
                            'white-space': 'nowrap',
                          }}
                          title={name}
                        >
                          {name}
                        </span>
                        <div style={{ display: 'flex', 'align-items': 'center', gap: '4px' }}>
                          <Show when={hasOverride()}>
                            <button
                              onClick={() => setLocalOverride(name as FeatureFlagName, null)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280',
                              }}
                              title="Remove override"
                            >
                              x
                            </button>
                          </Show>
                          <button
                            onClick={() =>
                              setLocalOverride(
                                name as FeatureFlagName,
                                !isEnabled(name as FeatureFlagName)
                              )
                            }
                            style={{
                              background: isEnabled(name as FeatureFlagName) ? '#10b981' : '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '2px 8px',
                              'border-radius': '4px',
                              cursor: 'pointer',
                              'min-width': '40px',
                            }}
                          >
                            {isEnabled(name as FeatureFlagName) ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    )
                  }}
                </For>
              </div>
            )}
          </Show>
        </div>
      </Show>
    </div>
  )
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a feature-gated function
 *
 * @example
 * ```ts
 * const trackAnalytics = withFeatureFlag(
 *   'analytics-dashboard',
 *   (event: string) => analytics.track(event),
 *   () => console.log('Analytics disabled')
 * )
 *
 * trackAnalytics('page_view') // Only runs if flag is enabled
 * ```
 */
export function createFeatureGatedFn<T extends (...args: any[]) => any>(
  flagName: FeatureFlagName,
  enabledFn: T,
  disabledFn?: (...args: Parameters<T>) => ReturnType<T>
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>) => {
    // This needs to be called within a component context
    // For standalone usage, you'd need to access the context differently
    try {
      const { isEnabled } = useFeatureFlags()
      if (isEnabled(flagName)) {
        return enabledFn(...args)
      }
      return disabledFn?.(...args)
    } catch {
      // If not in context, default to disabled
      return disabledFn?.(...args)
    }
  }
}
