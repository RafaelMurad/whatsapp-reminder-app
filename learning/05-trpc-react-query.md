# tRPC + React Query Data Flow

**Prerequisites:** Next.js Architecture, TypeScript basics  
**Time to Read:** 35-45 minutes  
**Difficulty:** Advanced

---

## 🎯 What You'll Learn

- End-to-end type safety without code generation
- tRPC procedures (queries vs mutations)
- React Query for server state management
- Optimistic updates and cache invalidation
- Monorepo API sharing
- Error handling patterns

---

## 📖 What is tRPC?

### Simple Definition
**tRPC** lets you call backend functions from your frontend with **full TypeScript type safety**, as if they were local functions. No code generation, no REST endpoints, no GraphQL schemas.

**Analogy:**
- **Traditional APIs** = Mailing a letter (write address, hope it arrives correctly)
- **tRPC** = Direct phone call (instant feedback if you dial wrong number)

### The Magic

**Backend (Server):**
```typescript
// packages/api/src/routers/reminder.ts
export const reminderRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const reminders = await prisma.reminder.findMany({
      where: { userId: ctx.user!.id },
    });
    return { reminders };
  }),
});
```

**Frontend (Client):**
```tsx
// apps/web - No imports, no types, just works
const { data } = trpc.reminder.getAll.useQuery();
//     ^^^^  
// TypeScript KNOWS this is { reminders: Reminder[] }
// Autocomplete works! Refactor-safe!
```

**How?** TypeScript's type inference propagates from server to client automatically.

---

## 🔄 Traditional API vs tRPC

### Traditional REST API

**Backend:**
```typescript
// server/api/reminders/route.ts
export async function GET(request: Request) {
  const reminders = await db.reminder.findMany();
  return Response.json({ reminders });
}
```

**Frontend:**
```typescript
// No type safety!
const response = await fetch('/api/reminders');
const data = await response.json();
//    ^^^^
// TypeScript: any 😭
// Might be { reminders } or { error } or anything

if (data.reminders) {  // Runtime check
  data.reminders.forEach(r => {
    console.log(r.title);  // Hope this property exists!
  });
}
```

**Problems:**
1. ❌ No type safety (client doesn't know server's shape)
2. ❌ Manual error handling (check status codes)
3. ❌ No autocomplete
4. ❌ Refactor breaks silently (rename field → runtime error)
5. ❌ Duplicate validation (client and server)

### tRPC Approach

**Backend:**
```typescript
// packages/api/src/routers/reminder.ts
import { z } from 'zod';

export const reminderRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const reminders = await prisma.reminder.findMany({
      where: { userId: ctx.user!.id },
    });
    return { reminders };
  }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(120),
      message: z.string().min(1).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      const reminder = await prisma.reminder.create({
        data: { ...input, userId: ctx.user!.id },
      });
      return { reminder };
    }),
});
```

**Frontend:**
```tsx
// apps/web/app/(protected)/dashboard/page.tsx
'use client';
import { trpc } from '@/lib/trpc';

const { data, isLoading } = trpc.reminder.getAll.useQuery();
//     ^^^^
// TypeScript: { reminders: Reminder[] } | undefined
// Full autocomplete!

const createMutation = trpc.reminder.create.useMutation();

async function handleCreate() {
  await createMutation.mutateAsync({
    title: "Buy milk",
    message: "Don't forget!",
    // TypeScript error if you miss a field!
  });
}
```

**Benefits:**
1. ✅ Full type safety (end-to-end)
2. ✅ Automatic error handling (React Query)
3. ✅ Autocomplete everywhere
4. ✅ Refactor-safe (rename → instant TypeScript error)
5. ✅ Single validation (Zod schema)

---

## 🏗️ tRPC Architecture

### 1. Define Procedures (Backend)

**Location:** `packages/api/src/routers/`

```typescript
// packages/api/src/routers/reminder.ts
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const reminderRouter = router({
  // QUERY (read data, no side effects)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // ctx has user info (from auth middleware)
    const reminders = await prisma.reminder.findMany({
      where: { userId: ctx.user!.id },
    });
    return { reminders };
  }),

  // MUTATION (write data, side effects)
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(120),
      message: z.string().min(1).max(500),
      scheduledFor: z.string().datetime(),
    }))
    .mutation(async ({ ctx, input }) => {
      const reminder = await prisma.reminder.create({
        data: {
          ...input,
          userId: ctx.user!.id,
          scheduledFor: new Date(input.scheduledFor),
        },
      });
      return { reminder };
    }),

  // MUTATION (delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.reminder.delete({
        where: { id: input.id, userId: ctx.user!.id },
      });
      return { success: true };
    }),
});
```

**Key concepts:**
- **`.query()`** - Read data (GET request)
- **`.mutation()`** - Write data (POST request)
- **`.input()`** - Validate input with Zod schema
- **`protectedProcedure`** - Requires authentication
- **`ctx`** - Context (user, session, etc.)

### 2. Combine Routers (Backend)

**Location:** `packages/api/src/index.ts`

```typescript
import { router } from './trpc';
import { authRouter } from './routers/auth';
import { reminderRouter } from './routers/reminder';

export const appRouter = router({
  auth: authRouter,
  reminder: reminderRouter,
});

export type AppRouter = typeof appRouter;
// ^^^^^ This type is imported by the client!
```

### 3. Create API Route (Next.js)

**Location:** `apps/web/app/api/trpc/[trpc]/route.ts`

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@repo/api';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
```

This creates `/api/trpc/*` endpoints that handle all tRPC requests.

### 4. Setup Client (Frontend)

**Location:** `apps/web/lib/trpc.ts`

```typescript
import { type AppRouter } from "@repo/api";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
//                                 ^^^^^^^^^^
// Import server's type!

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        headers() {
          const token = localStorage.getItem("auth_token");
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
```

### 5. Wrap App in Provider

**Location:** `apps/web/components/providers.tsx`

```typescript
const queryClient = new QueryClient();
const trpcClient = getTRPCClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### 6. Use in Components

```tsx
'use client';
import { trpc } from '@/lib/trpc';

export default function Dashboard() {
  const { data, isLoading } = trpc.reminder.getAll.useQuery();
  const deleteMutation = trpc.reminder.delete.useMutation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.reminders.map(reminder => (
        <li key={reminder.id}>
          {reminder.title}
          <button onClick={() => deleteMutation.mutate({ id: reminder.id })}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 🎣 React Query Integration

### What is React Query?

**React Query** (TanStack Query) manages server state (data from APIs) with caching, refetching, and optimistic updates.

### Queries (Read Data)

```tsx
const { data, isLoading, error, refetch } = trpc.reminder.getAll.useQuery();

// data: { reminders: Reminder[] } | undefined
// isLoading: boolean (true during first fetch)
// error: TRPCError | null (if request failed)
// refetch: () => void (manually refetch)
```

**Auto-refetching:**
- On window focus (tab back to app)
- On reconnect (internet back online)
- On mount (component renders)
- On interval (optional polling)

### Mutations (Write Data)

```tsx
const createMutation = trpc.reminder.create.useMutation({
  onSuccess: () => {
    // Invalidate cache to refetch
    queryClient.invalidateQueries(['reminder', 'getAll']);
  },
});

await createMutation.mutateAsync({
  title: "New reminder",
  message: "Test",
  scheduledFor: new Date().toISOString(),
});
```

**States:**
- `isLoading`: Request in progress
- `isSuccess`: Request completed successfully
- `isError`: Request failed
- `data`: Response data
- `error`: Error object

---

## ⚡ Optimistic Updates

### The Problem

**Without optimistic updates:**
```
User clicks Delete → Show spinner → Wait for server → Update UI
```
Feels slow! User waits 500ms to see result.

### The Solution

**With optimistic updates:**
```
User clicks Delete → Instantly remove from UI → Send request → Rollback if fails
```
Feels instant! UI updates immediately.

### Example

```tsx
const deleteMutation = trpc.reminder.delete.useMutation({
  onMutate: async (deletedReminder) => {
    // Cancel outgoing refetches (don't overwrite optimistic update)
    await queryClient.cancelQueries(['reminder', 'getAll']);

    // Snapshot current value (for rollback)
    const previous = queryClient.getQueryData(['reminder', 'getAll']);

    // Optimistically update UI
    queryClient.setQueryData(['reminder', 'getAll'], (old) => {
      return {
        reminders: old.reminders.filter(r => r.id !== deletedReminder.id)
      };
    });

    return { previous };  // Return context for rollback
  },
  
  onError: (err, deletedReminder, context) => {
    // Rollback on error
    queryClient.setQueryData(['reminder', 'getAll'], context.previous);
  },
  
  onSettled: () => {
    // Always refetch after mutation (success or error)
    queryClient.invalidateQueries(['reminder', 'getAll']);
  },
});
```

**Flow:**
1. User clicks delete
2. `onMutate`: Immediately remove from UI
3. Send request to server
4. Success: Keep optimistic update, refetch to confirm
5. Error: Rollback to previous state, show error

---

## 🌍 Our Tech vs Alternatives

### What We Use: tRPC 11 + React Query 5

**Philosophy:** Type-safe RPC for TypeScript monorepos  
**Official Docs:** https://trpc.io/docs

**Pros:**
- ✅ End-to-end type safety (zero codegen)
- ✅ Works with TypeScript monorepos
- ✅ Automatic React Query integration
- ✅ Small bundle size
- ✅ Simple setup

**Cons:**
- ❌ TypeScript only (no other languages)
- ❌ Not ideal for public APIs (internal use)
- ❌ Client and server must share code

**Best for:** Full-stack TypeScript apps, internal APIs

### Alternative 1: GraphQL (Apollo Client)

**Philosophy:** Query language for APIs  
**Official Docs:** https://www.apollographql.com/docs/

**Pros:**
- ✅ Language agnostic (works with any backend)
- ✅ Powerful querying (fetch exactly what you need)
- ✅ Great for public APIs
- ✅ Ecosystem (tools, libraries)

**Cons:**
- ❌ Complex setup (schema, resolvers, codegen)
- ❌ Larger bundle size
- ❌ Requires code generation for types
- ❌ Over-engineering for simple apps

**Key Difference:**
```graphql
# GraphQL - write queries as strings
query GetReminders {
  reminders {
    id
    title
    message
  }
}
```
```tsx
// tRPC - just call functions
const { data } = trpc.reminder.getAll.useQuery();
```

**When to use:** Public APIs, complex data requirements, non-TypeScript backends

### Alternative 2: REST + Zod

**Philosophy:** Traditional REST with validation  
**Official Docs:** https://zod.dev (Zod for validation)

**Pros:**
- ✅ Standard HTTP (works everywhere)
- ✅ Can use with any client/server
- ✅ Well understood by all developers
- ✅ Great for public APIs

**Cons:**
- ❌ No automatic type safety
- ❌ Manual validation on both sides
- ❌ Verbose (define routes, methods, etc.)
- ❌ Easy to get out of sync

**Example:**
```tsx
// Define schema
const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
});

// Fetch and validate
const response = await fetch('/api/reminders');
const data = ReminderSchema.array().parse(await response.json());
```

**When to use:** Public APIs, microservices, non-TypeScript environments

### Alternative 3: SWR

**Philosophy:** React Hooks for data fetching  
**Official Docs:** https://swr.vercel.app

**Pros:**
- ✅ Lightweight (smaller than React Query)
- ✅ Simple API
- ✅ Built by Vercel (Next.js team)
- ✅ Good defaults

**Cons:**
- ❌ Less features than React Query
- ❌ No mutation helpers
- ❌ Manual cache invalidation

**Key Difference:**
```tsx
// SWR
const { data } = useSWR('/api/reminders', fetcher);

// React Query (with tRPC)
const { data } = trpc.reminder.getAll.useQuery();
// Plus automatic mutations, invalidation, optimistic updates
```

**When to use:** Simple apps, prefer lightweight solutions

### Alternative 4: RTK Query (Redux)

**Philosophy:** Redux Toolkit's data fetching  
**Official Docs:** https://redux-toolkit.js.org/rtk-query/overview

**Pros:**
- ✅ Integrates with Redux
- ✅ Powerful caching
- ✅ Code generation for OpenAPI

**Cons:**
- ❌ Redux boilerplate
- ❌ Larger bundle
- ❌ Complex for simple needs

**When to use:** Already using Redux, need advanced caching strategies

---

## 📊 Comparison Table

| Solution | Type Safety | Bundle Size | Setup Complexity | Learning Curve | Public API |
|----------|-------------|-------------|------------------|----------------|------------|
| **tRPC** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ |
| GraphQL | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ✅ |
| REST + Zod | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| SWR | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| RTK Query | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ |

---

## 🤔 Reflection Questions

1. **What's the main benefit of tRPC over REST?**
   <details>
   <summary>Answer</summary>
   End-to-end type safety without code generation. Refactor backend → instant TypeScript errors in frontend. Autocomplete works everywhere.
   </details>

2. **When would you use `.query()` vs `.mutation()`?**
   <details>
   <summary>Answer</summary>
   `.query()` for reading data (GET, no side effects). `.mutation()` for writing data (POST/PUT/DELETE, has side effects).
   </details>

3. **What problem does React Query solve?**
   <details>
   <summary>Answer</summary>
   Server state management: caching, refetching, loading states, error handling, optimistic updates, deduplication.
   </details>

4. **Why use optimistic updates?**
   <details>
   <summary>Answer</summary>
   Instant UI feedback. Update UI immediately, rollback if server fails. App feels faster.
   </details>

5. **When would you choose GraphQL over tRPC?**
   <details>
   <summary>Answer</summary>
   Public APIs (external consumers), non-TypeScript backends, need flexible querying (fetch exactly what you need), microservices architecture.
   </details>

---

## 🔗 Official Resources

- **tRPC Docs:** https://trpc.io/docs
- **React Query Docs:** https://tanstack.com/query/latest/docs/framework/react/overview
- **Zod Docs:** https://zod.dev
- **GraphQL Docs:** https://graphql.org/learn/
- **SWR Docs:** https://swr.vercel.app
- **RTK Query Docs:** https://redux-toolkit.js.org/rtk-query/overview

---

## ✅ Key Takeaways

- tRPC enables **type-safe RPC** calls without code generation
- **Queries** read data, **mutations** write data
- **React Query** handles caching, refetching, loading states automatically
- **Optimistic updates** make UI feel instant
- Works perfectly in **monorepos** (shared types between packages)
- Best for **internal APIs**, not public-facing
- Tradeoff: TypeScript-only vs maximum type safety

---

**Next:** [06. Authentication Patterns →](./06-auth-patterns.md)
