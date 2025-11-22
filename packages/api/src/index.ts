import { router } from './trpc'
import { authRouter } from './routers/auth'
import { reminderRouter } from './routers/reminder'
import { featureFlagsRouter } from './routers/feature-flags'

// Main app router - combines all feature routers
export const appRouter = router({
  auth: authRouter,
  reminder: reminderRouter,
  featureFlags: featureFlagsRouter,
})

// Export type for frontend to use (enables end-to-end type safety)
export type AppRouter = typeof appRouter

// Export context type
export type { Context } from './context'

// Export tRPC utilities
export { createContext } from './context'

// Export feature flag utilities for server-side usage
export {
  isFeatureEnabled,
  getAllFlags,
  getFlagMetadata,
  getFlagsByCategory,
  getCurrentEnvironment,
  FEATURE_FLAGS,
  type FeatureFlagName,
  type FlagCategory,
  type FlagContext,
} from './lib/feature-flags'
