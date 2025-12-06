# Monorepo & pnpm Workspaces

**Prerequisites:** Basic npm/package.json knowledge  
**Time to Read:** 30-40 minutes  
**Difficulty:** Intermediate

---

## 🎯 What You'll Learn

- What monorepos are and why they exist
- pnpm workspaces configuration
- Package linking with `workspace:*`
- Shared TypeScript code between apps
- Running commands across packages
- Deployment strategies

---

## 📖 What is a Monorepo?

### Simple Definition
**Monorepo** = Multiple packages/apps in a single Git repository

**Analogy:**
- **Polyrepo** = Separate houses (each project has its own repo)
- **Monorepo** = Apartment building (all projects in one repo, shared infrastructure)

### Our Structure

```
whatsapp-reminder-app/          # Root (monorepo)
├── apps/
│   ├── web/                    # Next.js frontend app
│   ├── api-server/             # Standalone API (not used yet)
│   └── worker/                 # Background job worker
├── packages/
│   ├── api/                    # Shared tRPC routers
│   ├── db/                     # Shared Prisma schema
│   └── config/                 # Shared configs (eslint, tsconfig)
├── package.json                # Root package.json
└── pnpm-workspace.yaml         # Workspace config
```

**Why?**
- ✅ Share code between apps (`@repo/api`, `@repo/db`)
- ✅ Single dependency install (one `node_modules`)
- ✅ Atomic commits (change API + frontend together)
- ✅ Easy refactoring (TypeScript errors across packages)

---

## 🏗️ Workspace Configuration

### 1. Define Workspace

**Location:** `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*      # All folders in apps/
  - packages/*  # All folders in packages/

ignoredBuiltDependencies:
  - '@parcel/watcher'
  - '@prisma/client'
  - '@prisma/engines'
  - bcrypt
  - esbuild
  - prisma
```

**What this does:**
- Tells pnpm where to find packages
- `apps/*` = Runnable applications (web, worker)
- `packages/*` = Shared libraries (api, db)
- `ignoredBuiltDependencies` = Don't hoist these (each package builds its own)

### 2. Root package.json

**Location:** `package.json`

```json
{
  "name": "whatsapp-reminder-app",
  "version": "1.0.0",
  "private": true,  // Never publish root to npm
  
  "scripts": {
    // Run multiple packages in parallel
    "dev": "pnpm --filter db migrate && pnpm --filter db generate && pnpm --filter worker dev & pnpm --filter web dev",
    
    // Run single package
    "dev:web": "pnpm --filter web dev",
    "dev:worker": "pnpm --filter worker dev",
    
    // Build for deployment
    "build": "cd apps/web && pnpm build",
    
    // Database tools
    "db:studio": "pnpm --filter db studio",
    "db:migrate": "pnpm --filter db migrate"
  },
  
  "devDependencies": {
    // Shared across all packages
    "typescript": "^5.3.3",
    "@types/node": "^20.10.5"
  }
}
```

**Key patterns:**
- **`--filter <package>`** - Run command in specific package
- **`&`** - Run commands in parallel (bash operator)
- **`&&`** - Run commands sequentially (wait for previous)

---

## 📦 Package Linking

### Shared API Package

**Location:** `packages/api/package.json`

```json
{
  "name": "@repo/api",  // Namespace: @repo/
  "version": "1.0.0",
  "private": true,      // Internal only (not published)
  
  "exports": {
    ".": "./src/index.ts",                      // Main export
    "./services/whatsapp": "./src/services/whatsapp.ts"  // Sub-export
  },
  
  "dependencies": {
    "@repo/db": "workspace:*",  // Link to db package
    "@trpc/server": "^10.45.0",
    "zod": "^3.22.4"
  }
}
```

**Key concepts:**
- **`@repo/api`** - Namespace prevents conflicts (like `@company/package`)
- **`exports`** - Define what can be imported
- **`workspace:*`** - Link to other packages in monorepo (not npm!)

### Consuming in Web App

**Location:** `apps/web/package.json`

```json
{
  "name": "web",
  "dependencies": {
    "@repo/api": "workspace:*",  // Link to packages/api
    "next": "16.0.3",
    "react": "19.2.0"
  }
}
```

**Usage in code:**

```typescript
// apps/web/lib/trpc.ts
import { type AppRouter } from "@repo/api";
//                            ^^^^^^^^^^
// Directly imported from packages/api/src/index.ts

export const trpc = createTRPCReact<AppRouter>();
```

**How it works:**
1. pnpm sees `@repo/api: workspace:*`
2. Creates symlink: `node_modules/@repo/api` → `../../packages/api`
3. TypeScript resolves imports via symlink
4. Changes in `packages/api` instantly available in `apps/web`

---

## 🔄 Shared Database Package

### Database Package Structure

```
packages/db/
├── package.json
├── prisma/
│   ├── schema.prisma       # Single source of truth
│   └── migrations/         # Migration history
├── src/
│   └── index.ts            # Export Prisma client
└── tsconfig.json
```

**Location:** `packages/db/package.json`

```json
{
  "name": "@repo/db",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.19.0",
    "prisma": "^6.19.0"
  }
}
```

**Location:** `packages/db/src/index.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export * from '@prisma/client';  // Re-export types
```

### Using in Multiple Packages

```typescript
// packages/api/src/routers/reminder.ts
import { prisma } from '@repo/db';

const reminders = await prisma.reminder.findMany();

// apps/worker/src/index.ts
import { prisma } from '@repo/db';

const pending = await prisma.reminder.findMany({ 
  where: { status: 'pending' } 
});
```

**Benefits:**
- ✅ Single Prisma schema (no duplication)
- ✅ Shared types (`Reminder`, `User`, etc.)
- ✅ Migrations apply to all consumers
- ✅ One database connection config

---

## ⚙️ pnpm Commands

### Install Dependencies

```bash
# Install ALL packages (root + workspaces)
pnpm install

# Install in specific package
pnpm --filter web install react-icons
pnpm --filter api add zod
```

### Run Scripts

```bash
# Run in specific package
pnpm --filter web dev        # apps/web → npm run dev
pnpm --filter worker dev     # apps/worker → npm run dev

# Run in multiple packages (parallel)
pnpm --filter web --filter worker dev

# Run in ALL packages
pnpm -r dev                  # -r = recursive
```

### Build for Production

```bash
# Build dependencies first
pnpm --filter db generate    # Generate Prisma client
pnpm --filter api build      # Compile TypeScript (if needed)

# Build app
pnpm --filter web build      # Next.js production build
```

---

## 🌍 Our Tech vs Alternatives

### What We Use: pnpm Workspaces

**Philosophy:** Fast, disk-efficient package manager  
**Official Docs:** https://pnpm.io/workspaces

**Pros:**
- ✅ Fastest install speed (hard links)
- ✅ Saves disk space (global store)
- ✅ Strict dependency resolution (no phantom deps)
- ✅ Built-in workspace support
- ✅ `workspace:*` protocol

**Cons:**
- ❌ Less adoption than npm/yarn (smaller ecosystem)
- ❌ Some tools don't support pnpm (rare)

**Key feature:**
```bash
# pnpm stores packages once, links everywhere
~/.pnpm-store/
  react@19.2.0/
apps/web/node_modules/react → ~/.pnpm-store/react@19.2.0
packages/api/node_modules/react → ~/.pnpm-store/react@19.2.0
```

**Best for:** Monorepos, fast CI, disk space savings

### Alternative 1: npm Workspaces

**Philosophy:** Built into npm (v7+)  
**Official Docs:** https://docs.npmjs.com/cli/v7/using-npm/workspaces

**Pros:**
- ✅ Built-in (no extra install)
- ✅ Universal support
- ✅ Simple setup

**Cons:**
- ❌ Slower installs than pnpm
- ❌ Wastes disk space (duplicates packages)
- ❌ Phantom dependencies (can import undeclared deps)

**Setup:**
```json
// package.json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

**When to use:** Simple projects, team already uses npm

### Alternative 2: Yarn Workspaces

**Philosophy:** Original workspace implementation  
**Official Docs:** https://yarnpkg.com/features/workspaces

**Pros:**
- ✅ Mature (been around longest)
- ✅ Plug'n'Play mode (zero installs)
- ✅ Good tooling support

**Cons:**
- ❌ Slower than pnpm
- ❌ Plug'n'Play breaks some tools
- ❌ Yarn v1 vs v2+ confusion

**When to use:** Existing Yarn projects, need Plug'n'Play

### Alternative 3: Turborepo

**Philosophy:** Build orchestration for monorepos  
**Official Docs:** https://turbo.build/repo/docs

**Pros:**
- ✅ Task caching (skip unchanged builds)
- ✅ Parallel execution (smart scheduling)
- ✅ Remote caching (share across team)
- ✅ Works with npm/yarn/pnpm

**Cons:**
- ❌ Extra tool (on top of package manager)
- ❌ More complex setup

**Not a package manager!** Works WITH pnpm/npm/yarn.

**Example:**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": [".next/**"]   // Cache output
    }
  }
}
```

**When to use:** Large monorepos, slow builds, multiple teams

### Alternative 4: Nx

**Philosophy:** Enterprise monorepo framework  
**Official Docs:** https://nx.dev

**Pros:**
- ✅ Powerful code generation
- ✅ Dependency graph visualization
- ✅ Advanced caching
- ✅ Plugin ecosystem

**Cons:**
- ❌ Steep learning curve
- ❌ Opinionated structure
- ❌ Overkill for small projects

**When to use:** Large enterprises, Angular projects, need scaffolding

---

## 📊 Comparison Table

| Solution | Setup | Speed | Caching | Best For |
|----------|-------|-------|---------|----------|
| **pnpm** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | General monorepos |
| npm | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | Simple projects |
| Yarn | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | Existing Yarn users |
| Turborepo | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Build optimization |
| Nx | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise scale |

---

## 🚀 Deployment Strategies

### Vercel (Next.js)

**Location:** `apps/web/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js where monorepo root is
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  
  // Transpile workspace packages
  transpilePackages: ['@repo/api'],
};

export default nextConfig;
```

**Vercel deployment:**
1. Root directory: `apps/web`
2. Build command: `cd ../.. && pnpm install && cd apps/web && pnpm build`
3. Vercel automatically traces dependencies via `outputFileTracingRoot`

### Docker (Worker)

```dockerfile
# Dockerfile for apps/worker
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/worker ./apps/worker
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Run worker
WORKDIR /app/apps/worker
CMD ["pnpm", "dev"]
```

**Key:** Include `packages/` in Docker image (dependencies!)

### Separate Deployments

```bash
# Web app → Vercel
cd apps/web && pnpm build && vercel deploy

# Worker → Railway/Render
cd apps/worker && pnpm build && railway up

# API server → Fly.io
cd apps/api-server && pnpm build && fly deploy
```

**Challenge:** Ensure all share same database (connection string in `.env`)

---

## 🔧 Real-World Examples

### 1. Shared Validation

```typescript
// packages/api/src/routers/reminder.ts
export const createReminderSchema = z.object({
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
});

// apps/web/app/(protected)/dashboard/page.tsx
import { createReminderSchema } from '@repo/api/routers/reminder';
// ^^^ Reuse server validation on client for instant feedback
```

### 2. Shared Types

```typescript
// packages/db/src/index.ts
export * from '@prisma/client';  // Re-export Prisma types

// apps/web/components/reminder-card.tsx
import type { Reminder } from '@repo/db';

function ReminderCard({ reminder }: { reminder: Reminder }) {
  // TypeScript knows all fields!
}
```

### 3. Shared Utilities

```typescript
// packages/api/src/lib/auth.ts
export function verifyJwt(token: string) { ... }

// apps/worker/src/index.ts
import { verifyJwt } from '@repo/api/lib/auth';
// ^^^ Same auth logic in worker
```

---

## 🤔 Reflection Questions

1. **What's the main benefit of a monorepo?**
   <details>
   <summary>Answer</summary>
   Share code between apps without publishing to npm. Atomic commits (change API + frontend together). Single source of truth for types/validation.
   </details>

2. **What does `workspace:*` mean?**
   <details>
   <summary>Answer</summary>
   Link to another package in the same monorepo (not from npm). pnpm creates symlink to local package.
   </details>

3. **Why use `@repo/` namespace?**
   <details>
   <summary>Answer</summary>
   Prevents conflicts with npm packages. Makes it clear which packages are internal. Matches npm scoped package convention.
   </details>

4. **When should you NOT use a monorepo?**
   <details>
   <summary>Answer</summary>
   Different teams with no shared code, independent release cycles, different tech stacks (e.g., Go backend + React frontend), public libraries (need versioning).
   </details>

5. **What's the difference between pnpm and Turborepo?**
   <details>
   <summary>Answer</summary>
   pnpm = package manager (installs dependencies). Turborepo = build orchestrator (caches builds, runs tasks). Use together for best results.
   </details>

---

## 🔗 Official Resources

- **pnpm Docs:** https://pnpm.io
- **pnpm Workspaces:** https://pnpm.io/workspaces
- **npm Workspaces:** https://docs.npmjs.com/cli/v7/using-npm/workspaces
- **Yarn Workspaces:** https://yarnpkg.com/features/workspaces
- **Turborepo:** https://turbo.build/repo/docs
- **Nx:** https://nx.dev
- **Vercel Monorepo:** https://vercel.com/docs/monorepos

---

## ✅ Key Takeaways

- **Monorepos** unify multiple packages/apps in one repository
- **pnpm workspaces** enable fast, efficient package management
- **`workspace:*`** links packages without npm publishing
- **Shared packages** eliminate code duplication (api, db, config)
- **Deployment** requires special config (`outputFileTracingRoot` for Next.js)
- **Turborepo/Nx** add build caching for large monorepos
- **Tradeoff:** Setup complexity vs code sharing benefits

---

**Next:** [Advanced Topics (Suggestions) →](./suggestions/)

🎉 **Congratulations!** You've completed all 7 core learning documents. You now understand every major technology used in this premium redesign branch!
