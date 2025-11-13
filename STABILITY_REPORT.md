# 🔧 Stability Report & Fixes

**Date:** November 13, 2025
**Status:** 🔴 CRITICAL ISSUES FOUND

---

## 🚨 Critical Issues Preventing Development

### 1. **Prisma Client Not Generated** (BLOCKER)

**Problem:**
- Prisma client generation fails with `403 Forbidden` when downloading engine binaries
- This blocks all database operations and causes cascading TypeScript errors
- Root cause: Network restrictions preventing download from `https://binaries.prisma.sh`

**Error:**
```
Failed to fetch the engine file at https://binaries.prisma.sh/all_commits/605197351a3c8bdd595af2d2a9bc3025bca48ea2/debian-openssl-3.0.x/schema-engine.gz - 403 Forbidden
```

**Impact:**
- ❌ Cannot import `@prisma/client`
- ❌ TypeScript compilation fails in API package
- ❌ Development server cannot start
- ❌ Database migrations cannot run

**Solutions:**

#### Option A: Use Pre-compiled Prisma (RECOMMENDED)
```bash
# 1. Add Prisma engines as dependencies
cd packages/db
pnpm add @prisma/engines

# 2. Generate with local engines
PRISMA_CLI_BINARY_TARGETS="native" pnpm prisma generate --skip-download
```

#### Option B: Use Prisma Data Proxy
Update `schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["dataProxy"]
}

datasource db {
  provider = "postgresql" // Switch from SQLite
  url      = env("DATABASE_URL")
}
```

#### Option C: Manual Binary Download (Temporary Fix)
```bash
# Download manually from GitHub releases
wget https://github.com/prisma/prisma-engines/releases/download/5.7.1/prisma-engines.tar.gz
# Extract and place in node_modules
```

#### Option D: Use Alternative ORM
Consider switching to:
- **Drizzle ORM** - Lighter, no codegen issues
- **Kysely** - Type-safe SQL query builder
- **TypeORM** - More battle-tested

---

### 2. **Missing API Entry Point** (BLOCKER)

**Problem:**
- `packages/api/package.json` exports `"./src/index.ts"` but file doesn't exist
- No tRPC app router created
- No routers directory

**Missing Files:**
```
packages/api/src/
├── index.ts          ❌ (exports app router)
└── routers/          ❌ (directory doesn't exist)
    ├── index.ts      ❌ (combines all routers)
    ├── auth.ts       ❌ (register, login, me, logout)
    └── reminder.ts   ❌ (CRUD operations)
```

**Solution:**
Create the missing files (see templates below)

---

### 3. **No Environment Configuration** (HIGH)

**Problem:**
- `.env` file doesn't exist (only `.env.example`)
- Required environment variables not set:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`

**Solution:**
```bash
cp .env.example .env

# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" >> .env
```

---

### 4. **Database Not Initialized** (HIGH)

**Problem:**
- No migrations created
- No `dev.db` file exists
- Prisma client not generated (see issue #1)

**Solution:**
```bash
# After fixing Prisma issue
pnpm db:migrate  # Creates migrations and database
```

---

### 5. **Build Scripts Disabled** (MEDIUM)

**Problem:**
- pnpm ignores lifecycle scripts for critical packages:
  - `@prisma/client` (needs postinstall)
  - `bcrypt` (needs node-gyp build)
  - `esbuild` (needs binary download)

**Warning Message:**
```
Ignored build scripts: @parcel/watcher, @prisma/client, @prisma/engines, bcrypt, esbuild, prisma.
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

**Solution:**
```bash
# Approve build scripts (interactive)
pnpm approve-builds

# Or create .npmrc to auto-approve
echo "enable-pre-post-scripts=true" >> .npmrc
pnpm install
```

---

### 6. **Missing Frontend tRPC Setup** (HIGH)

**Problem:**
- No tRPC client configured in web app
- Missing `apps/web/src/lib/trpc.ts`
- No @tanstack/solid-query setup

**Impact:**
- ❌ Cannot call API from frontend
- ❌ No type-safe API calls

**Solution:**
Create `apps/web/src/lib/trpc.ts` (see template below)

---

## 🛠️ File Templates to Create

### 1. `packages/api/src/index.ts`
```typescript
import { router } from './trpc'
import { authRouter } from './routers/auth'
import { reminderRouter } from './routers/reminder'

// Main app router - combines all feature routers
export const appRouter = router({
  auth: authRouter,
  reminder: reminderRouter,
})

// Export type for frontend to use
export type AppRouter = typeof appRouter
```

### 2. `packages/api/src/routers/auth.ts`
```typescript
import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { prisma } from '@repo/db'
import { hashPassword, verifyPassword, signJwt } from '../lib/auth'

export const authRouter = router({
  // POST /api/auth/register
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/), // E.164 format
    }))
    .mutation(async ({ input }) => {
      // Check if user exists
      const exists = await prisma.user.findUnique({ where: { email: input.email } })
      if (exists) throw new Error('Email already registered')

      // Hash password and create user
      const hashedPassword = await hashPassword(input.password)
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          phoneNumber: input.phoneNumber,
        },
      })

      // Return JWT token
      const token = signJwt({ userId: user.id, email: user.email })
      return { token, user: { id: user.id, email: user.email } }
    }),

  // POST /api/auth/login
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Find user
      const user = await prisma.user.findUnique({ where: { email: input.email } })
      if (!user) throw new Error('Invalid credentials')

      // Verify password
      const valid = await verifyPassword(input.password, user.password)
      if (!valid) throw new Error('Invalid credentials')

      // Return JWT token
      const token = signJwt({ userId: user.id, email: user.email })
      return { token, user: { id: user.id, email: user.email } }
    }),

  // GET /api/auth/me
  me: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.user is guaranteed to exist (protected procedure)
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.userId },
        select: { id: true, email: true, phoneNumber: true, createdAt: true },
      })
      return user
    }),
})
```

### 3. `packages/api/src/routers/reminder.ts`
```typescript
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { prisma } from '@repo/db'

export const reminderRouter = router({
  // GET /api/reminder/list
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await prisma.reminder.findMany({
        where: { userId: ctx.user.userId },
        orderBy: { scheduledFor: 'asc' },
      })
    }),

  // POST /api/reminder/create
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      message: z.string().min(1).max(500),
      scheduledFor: z.string().datetime(), // ISO 8601 string
    }))
    .mutation(async ({ input, ctx }) => {
      return await prisma.reminder.create({
        data: {
          title: input.title,
          message: input.message,
          scheduledFor: new Date(input.scheduledFor),
          userId: ctx.user.userId,
        },
      })
    }),

  // PATCH /api/reminder/update
  update: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      title: z.string().min(1).max(100).optional(),
      message: z.string().min(1).max(500).optional(),
      scheduledFor: z.string().datetime().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const reminder = await prisma.reminder.findFirst({
        where: { id: input.id, userId: ctx.user.userId },
      })
      if (!reminder) throw new Error('Reminder not found')

      // Update
      return await prisma.reminder.update({
        where: { id: input.id },
        data: {
          title: input.title,
          message: input.message,
          scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
        },
      })
    }),

  // DELETE /api/reminder/delete
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const reminder = await prisma.reminder.findFirst({
        where: { id: input.id, userId: ctx.user.userId },
      })
      if (!reminder) throw new Error('Reminder not found')

      // Delete
      await prisma.reminder.delete({ where: { id: input.id } })
      return { success: true }
    }),
})
```

### 4. `packages/api/src/routers/index.ts`
```typescript
export * from './auth'
export * from './reminder'
```

### 5. `apps/web/src/lib/trpc.ts`
```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { QueryClient } from '@tanstack/solid-query'
import type { AppRouter } from '@repo/api'

// Create tRPC client
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      headers() {
        const token = localStorage.getItem('auth_token')
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})

// Create React Query client for caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})
```

---

## 📋 Step-by-Step Fix Checklist

### Phase 1: Core Infrastructure (30 mins)
- [ ] Create `.env` file from `.env.example`
- [ ] Generate secure `JWT_SECRET`
- [ ] Fix Prisma client generation (try solutions A-D above)
- [ ] Run database migrations
- [ ] Verify database created (`packages/db/prisma/dev.db`)

### Phase 2: Backend Setup (1 hour)
- [ ] Create `packages/api/src/routers/` directory
- [ ] Create `packages/api/src/routers/auth.ts`
- [ ] Create `packages/api/src/routers/reminder.ts`
- [ ] Create `packages/api/src/routers/index.ts`
- [ ] Create `packages/api/src/index.ts`
- [ ] Test TypeScript compilation: `pnpm --filter @repo/api exec tsc --noEmit`

### Phase 3: Frontend Setup (30 mins)
- [ ] Create `apps/web/src/lib/` directory
- [ ] Create `apps/web/src/lib/trpc.ts`
- [ ] Test development server: `pnpm dev`

### Phase 4: Verification (15 mins)
- [ ] Run full TypeScript check: `pnpm -r exec tsc --noEmit`
- [ ] Start dev server successfully
- [ ] Test API endpoint (curl or Postman)
- [ ] Verify hot reload works

---

## 🎯 Recommended Next Steps

After stabilizing the project:

1. **Create seed data**
   ```typescript
   // packages/db/prisma/seed.ts
   ```

2. **Add API testing**
   - Install vitest
   - Write integration tests for routers

3. **Setup linting**
   ```bash
   pnpm add -D -w eslint @typescript-eslint/eslint-plugin
   ```

4. **Add CI/CD**
   - Create `.github/workflows/test.yml`
   - Run tests on push
   - Check TypeScript compilation

---

## 🚀 Alternative: Quick Start from Scratch

If fixes are too complex, consider:

### Option 1: Use T3 Stack Starter
```bash
npx create-t3-app@latest --solid
```
Includes: tRPC + Prisma + Auth + TypeScript preconfigured

### Option 2: Simplified Stack
Replace problematic parts:
- **Prisma** → **Drizzle ORM** (no binary downloads)
- **JWT** → **Lucia Auth** (more secure)
- **SolidStart** → **Next.js** (better docs)

---

## 📊 Current Project Health Score

| Category | Status | Score |
|----------|--------|-------|
| Dependencies | 🟡 Installed, scripts blocked | 6/10 |
| TypeScript | 🔴 Cannot compile | 2/10 |
| Database | 🔴 Not initialized | 0/10 |
| Backend | 🟡 Foundation only | 3/10 |
| Frontend | 🟡 Basic setup | 4/10 |
| **Overall** | 🔴 **CANNOT RUN** | **3/10** |

---

## 🆘 Priority Actions (Do This First)

1. **Fix Prisma** (blocks everything)
   - Try option A from issue #1
   - If fails, switch to Drizzle ORM

2. **Create `.env`** (5 seconds)
   ```bash
   cp .env.example .env
   ```

3. **Create API routers** (copy templates above)

4. **Test basic compilation**
   ```bash
   pnpm -r exec tsc --noEmit
   ```

---

**Need Help?** Issues ranked by priority:
1. 🔥 Prisma generation
2. 🔥 Missing API files
3. ⚠️ Environment variables
4. ⚠️ Database migrations
5. ℹ️ Build scripts approval

**Estimated Time to Stable:** 2-3 hours (if Prisma cooperates) or 4-6 hours (if need to switch ORMs)
