import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

// Initialize tRPC builder with our Context type
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    // Keep default shape for now; can enhance later (e.g., Zod issues)
    return shape;
  },
});

// Export helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Auth guard: ensures a user is present in context
const authMiddleware = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = publicProcedure.use(authMiddleware);
