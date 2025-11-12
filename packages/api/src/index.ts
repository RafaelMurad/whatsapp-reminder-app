export { createContext } from './context';
export type { Context } from './context';

import { router } from './trpc';
import { authRouter } from './routers/auth';
import { reminderRouter } from './routers/reminder';

export const appRouter = router({
  auth: authRouter,
  reminder: reminderRouter,
});

export type AppRouter = typeof appRouter;
