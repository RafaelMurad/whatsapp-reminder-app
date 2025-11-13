import { router } from './trpc'
import { authRouter } from './routers/auth'
import { reminderRouter } from './routers/reminder'

// Main app router - combines all feature routers
export const appRouter = router({
  auth: authRouter,
  reminder: reminderRouter,
})

// Export type for frontend to use (enables end-to-end type safety)
export type AppRouter = typeof appRouter

// Export context type
export type { Context } from './context'

// Export tRPC utilities
export { createContext } from './context'
