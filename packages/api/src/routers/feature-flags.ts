/**
 * Feature Flags Router
 *
 * tRPC router for exposing feature flags to the client.
 * Provides type-safe access to flag values and metadata.
 *
 * @module routers/feature-flags
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import {
  isFeatureEnabled,
  getAllFlags,
  getFlagMetadata,
  getFlagsByCategory,
  flagNameSchema,
  flagContextSchema,
  FEATURE_FLAGS,
  type FeatureFlagName,
} from '../lib/feature-flags'

export const featureFlagsRouter = router({
  /**
   * Get all feature flags for the current user
   * Returns a map of flag names to boolean values
   *
   * @example
   * ```ts
   * const flags = await trpc.featureFlags.getAll.query()
   * if (flags['dark-mode-theme']) {
   *   // Enable dark mode
   * }
   * ```
   */
  getAll: publicProcedure
    .input(flagContextSchema.optional())
    .query(({ input, ctx }) => {
      // Build context from request + input
      const context = {
        userId: ctx.user?.userId ?? input?.userId,
        email: ctx.user?.email ?? input?.email,
        environment: input?.environment,
        timestamp: new Date(),
      }

      return getAllFlags(context)
    }),

  /**
   * Check if a specific flag is enabled
   *
   * @example
   * ```ts
   * const isEnabled = await trpc.featureFlags.isEnabled.query({
   *   flagName: 'dark-mode-theme'
   * })
   * ```
   */
  isEnabled: publicProcedure
    .input(
      z.object({
        flagName: flagNameSchema,
        context: flagContextSchema.optional(),
      })
    )
    .query(({ input, ctx }) => {
      const context = {
        userId: ctx.user?.userId ?? input.context?.userId,
        email: ctx.user?.email ?? input.context?.email,
        environment: input.context?.environment,
        timestamp: new Date(),
      }

      return {
        flagName: input.flagName,
        enabled: isFeatureEnabled(input.flagName, context),
      }
    }),

  /**
   * Get metadata for a specific flag (for debugging/admin)
   */
  getFlagInfo: publicProcedure
    .input(z.object({ flagName: flagNameSchema }))
    .query(({ input }) => {
      return getFlagMetadata(input.flagName)
    }),

  /**
   * Get all flags grouped by category
   */
  getByCategory: publicProcedure.query(() => {
    return getFlagsByCategory()
  }),

  /**
   * List all available flag names with descriptions
   * Useful for documentation and admin UIs
   */
  list: publicProcedure.query(() => {
    return Object.entries(FEATURE_FLAGS).map(([name, config]) => ({
      name: name as FeatureFlagName,
      description: config.description,
      category: config.category,
      type: config.type,
      addedAt: config.addedAt,
    }))
  }),

  /**
   * Batch check multiple flags at once
   * More efficient than multiple single checks
   */
  checkMultiple: publicProcedure
    .input(
      z.object({
        flagNames: z.array(flagNameSchema),
        context: flagContextSchema.optional(),
      })
    )
    .query(({ input, ctx }) => {
      const context = {
        userId: ctx.user?.userId ?? input.context?.userId,
        email: ctx.user?.email ?? input.context?.email,
        environment: input.context?.environment,
        timestamp: new Date(),
      }

      const result: Record<string, boolean> = {}
      for (const flagName of input.flagNames) {
        result[flagName] = isFeatureEnabled(flagName, context)
      }
      return result
    }),
})

export type FeatureFlagsRouter = typeof featureFlagsRouter
