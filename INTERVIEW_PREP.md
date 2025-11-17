# Technical Interview Prep - WhatsApp Reminder App

## Purpose
This document prepares you to confidently discuss every technical decision in this project. It covers the "why" behind choices, trade-offs, and deep technical concepts.

---

## Table of Contents
1. [The SolidJS Decision](#1-the-solidjs-decision)
2. [Migration to React/Next.js](#2-migration-to-reactnextjs)
3. [tRPC Deep Dive](#3-trpc-deep-dive)
4. [ORM Comparison: Prisma vs Drizzle](#4-orm-comparison-prisma-vs-drizzle)
5. [Monorepo Architecture](#5-monorepo-architecture)
6. [Authentication & Security](#6-authentication--security)
7. [Deployment Challenges](#7-deployment-challenges)
8. [Common Interview Questions](#8-common-interview-questions)

---

## 1. The SolidJS Decision

### "Why did you choose SolidJS initially?"

**Good Answer:**
> "I chose SolidJS as a learning opportunity to understand fine-grained reactivity and signals - a different mental model than React's virtual DOM reconciliation. I wanted to understand how reactive systems work at a fundamental level before React 19 introduces signals natively. The project was also small enough that ecosystem size wasn't a blocker, which gave me freedom to explore."

**Key Points to Know:**
- SolidJS has **no virtual DOM** - updates are direct DOM manipulations
- Uses **signals** for reactivity (similar to Vue 3 composition API)
- Smaller bundle size (~7KB vs React's ~40KB)
- Better runtime performance in benchmarks
- Growing but smaller ecosystem

### What Was Interesting About SolidJS?

**Technical Concepts to Understand:**

#### 1. Fine-Grained Reactivity
```javascript
// SolidJS - Signal-based reactivity
const [count, setCount] = createSignal(0)

createEffect(() => {
  console.log('Count changed:', count())
})

setCount(5) // Effect runs automatically
```

**How it works:**
- Signals are **getters/setters** (notice `count()` vs `count`)
- Effects track dependencies automatically (no dependency array needed)
- Updates are **synchronous** and **targeted** (only affected DOM nodes update)
- No re-rendering of entire component tree

**Contrast with React:**
```javascript
// React - State-based reactivity
const [count, setCount] = useState(0)

useEffect(() => {
  console.log('Count changed:', count)
}, [count]) // Must declare dependencies manually
```

**How React works:**
- State changes trigger component re-render
- React reconciles virtual DOM to find changes
- Updates are **batched** and **asynchronous**
- Entire component function re-runs (optimization via memoization)

**Interview Answer:**
> "SolidJS taught me that reactivity doesn't require a virtual DOM. It compiles reactive statements into efficient subscriptions at build time. When you call `setCount(5)`, only the specific DOM text node updates - no diffing, no reconciliation. This is conceptually similar to Svelte's compile-time reactivity or Vue's Proxy-based reactivity."

#### 2. No Component Re-renders

**SolidJS:**
```jsx
function Counter() {
  const [count, setCount] = createSignal(0)

  console.log('Component only runs ONCE')

  return (
    <div>
      <p>{count()}</p>  {/* This updates reactively */}
      <button onClick={() => setCount(count() + 1)}>+</button>
    </div>
  )
}
```

**React:**
```jsx
function Counter() {
  const [count, setCount] = useState(0)

  console.log('Component runs on EVERY state change')

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

**Interview Answer:**
> "In SolidJS, the component function runs only once - it's essentially a setup function. The JSX compiles into DOM instructions with embedded reactive getters. In React, the component function is the render function - it re-runs on every state change, which is why we need useMemo and useCallback to optimize."

#### 3. SolidStart (Meta-Framework)

**What it provides:**
- File-based routing (like Next.js App Router)
- Server-side rendering (SSR)
- API routes
- Build optimizations

**Why it exists:**
- SolidJS alone is just a UI library (like React)
- SolidStart is to SolidJS what Next.js is to React
- Provides full-stack capabilities

---

## 2. Migration to React/Next.js

### "Why did you decide to migrate?"

**Bad Answer:**
> "React is more popular"

**Good Answer:**
> "I made a strategic decision based on three factors: First, deployment. SolidStart is newer and has edge cases with serverless platforms - I hit Prisma bundling issues and SSR configuration challenges that consumed 2 days of debugging. Second, the job market. I researched and found 10,000+ React positions globally versus fewer than 50 for SolidJS. Third, I realized I could reuse 70% of my codebase - the entire backend with tRPC, Prisma, auth, and business logic works with any frontend framework. So migration was 5-7 days versus 6+ weeks to rebuild in React from scratch. I kept the SolidJS learnings about reactivity and signals, which are actually coming to React 19 anyway."

### What Did You Learn From the Migration?

**Interview Answer:**
> "The migration validated my architectural decisions. Because I built the backend with tRPC and kept business logic separate from UI logic, I could swap entire frontend frameworks without touching 70% of my code. This taught me the value of framework-agnostic architecture and clear separation of concerns. It also showed me that understanding reactivity concepts transfers across frameworks - signals in SolidJS helped me understand React's upcoming use() hook and Server Components data flow."

### Technical Differences: SolidJS vs React

| Aspect | SolidJS | React |
|--------|---------|-------|
| **Reactivity** | Signals (fine-grained) | Virtual DOM reconciliation |
| **Updates** | Direct DOM manipulation | Diff virtual trees, batch updates |
| **Performance** | Faster runtime (no diffing) | Slower but predictable |
| **Bundle Size** | ~7KB | ~40KB |
| **Learning Curve** | Steeper (new mental model) | Gentler (functional programming) |
| **Ecosystem** | Small but growing | Massive (every library exists) |
| **Job Market** | <50 positions | 10,000+ positions |
| **Deployment** | SolidStart is new, some edge cases | Next.js is battle-tested |
| **Devtools** | Basic | React DevTools (mature) |

### Next.js 16 Specifics

**What's different from SolidStart?**

1. **App Router** - File-based routing with layouts
2. **Server Components** - Components render on server by default
3. **Server Actions** - Direct server functions (no API routes needed)
4. **Streaming SSR** - Progressive page rendering
5. **Automatic code splitting** - Route-level by default

**Interview Question: "What's a Server Component?"**

**Good Answer:**
> "Server Components run only on the server and never send JavaScript to the client. They're great for data fetching because you can directly query databases without exposing API endpoints. They return serialized UI to the client. Client Components are traditional React components marked with 'use client' - they hydrate and become interactive on the browser. The key insight is that you can compose them - Server Components can render Client Components, allowing you to minimize JavaScript sent to users while still having interactivity where needed."

---

## 3. tRPC Deep Dive

### "Why did you use tRPC instead of REST or GraphQL?"

**Good Answer:**
> "I chose tRPC for end-to-end type safety without code generation. With REST, you write OpenAPI specs or rely on manual typing - easy to get out of sync. With GraphQL, you write schemas and run codegen tools. With tRPC, I define my API once using Zod validators, and TypeScript automatically infers types on both client and server. If I rename a field on the backend, the frontend shows type errors instantly - no build step, no codegen, no sync issues. It's perfect for TypeScript monorepos where you control both ends of the API."

### How tRPC Works (Deep Dive)

#### Backend Definition
```typescript
// packages/api/src/routers/reminder.ts
export const reminderRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      message: z.string().min(1).max(500),
      scheduledFor: z.string().datetime(),
    }))
    .mutation(async ({ input, ctx }) => {
      // ctx.user available because of protectedProcedure
      return await db.reminder.create({
        data: {
          ...input,
          userId: ctx.user.userId,
          scheduledFor: new Date(input.scheduledFor),
        }
      })
    })
})
```

#### Frontend Usage
```typescript
// apps/web/src/components/CreateReminder.tsx
const createMutation = trpc.reminder.create.useMutation()

// TypeScript knows EXACTLY what input type is required
await createMutation.mutateAsync({
  title: "Meeting",
  message: "Team sync",
  scheduledFor: "2025-11-20T10:00:00Z"
})
// TypeScript error if you pass wrong type or miss a field
```

**What's Happening Under the Hood:**

1. **Backend exports router type:**
```typescript
export type AppRouter = typeof appRouter
```

2. **Frontend imports type (NOT runtime code):**
```typescript
import type { AppRouter } from '@repo/api'

const trpc = createTRPCReact<AppRouter>()
```

3. **TypeScript inference magic:**
   - `.create` autocompletes because TypeScript knows router shape
   - `.input()` knows expected input from Zod schema
   - Return type inferred from mutation function

4. **Runtime execution:**
   - Client calls `trpc.reminder.create.mutate()`
   - Serializes to HTTP POST `/api/trpc/reminder.create`
   - Server deserializes, runs Zod validation, executes function
   - Response serialized back to client
   - Client gets typed result

### tRPC vs REST vs GraphQL

**When interviewer asks: "What are the trade-offs?"**

| Feature | tRPC | REST | GraphQL |
|---------|------|------|---------|
| **Type Safety** | Automatic via TypeScript | Manual (OpenAPI → codegen) | Schema → codegen |
| **Documentation** | Types ARE docs | OpenAPI spec needed | GraphQL schema is docs |
| **Flexibility** | Fixed procedures | Fixed endpoints | Flexible queries |
| **Overfetching** | Backend controls response | Common issue | Client controls response |
| **Caching** | Use TanStack Query | HTTP caching (standard) | Complex (Apollo, etc.) |
| **Learning Curve** | Low (if you know TS) | Low (standard HTTP) | Moderate (new query language) |
| **Use Case** | TypeScript monorepos | Public APIs, microservices | Complex data graphs, mobile apps |
| **Network Efficiency** | RPC calls (batch support) | RESTful resources | Single endpoint, precise queries |

**Interview Answer:**
> "tRPC is ideal when you control both client and server and use TypeScript. It's not great for public APIs or non-TypeScript clients. REST is better for public APIs, third-party integrations, and HTTP caching. GraphQL shines when you have complex nested data and want clients to specify exactly what they need - great for mobile apps with limited bandwidth. For this portfolio project, tRPC was perfect because it's a monorepo and I wanted to showcase modern TypeScript patterns."

---

## 4. ORM Comparison: Prisma vs Drizzle

### "I see you have a branch with Drizzle. Why did you explore that?"

**Good Answer:**
> "I hit an issue where Prisma's client generation failed in certain environments because it downloads platform-specific binaries. I explored Drizzle as an alternative because it's pure TypeScript - no binary downloads, no code generation, just TypeScript inference. It's lighter and uses a query builder syntax closer to SQL. However, I stuck with Prisma for the main project because it has better tooling (Prisma Studio for database GUI), clearer error messages, and a larger community. The Drizzle exploration taught me about different ORM philosophies."

### Technical Comparison

#### Prisma (Schema-First)
```prisma
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  reminders Reminder[]
}

model Reminder {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

**Workflow:**
1. Define schema in `.prisma` file
2. Run `prisma migrate dev` → generates SQL migrations
3. Run `prisma generate` → generates TypeScript client
4. Use generated client in code

**Pros:**
- Declarative schema (easy to read)
- Automatic migrations with history
- Prisma Studio (database GUI)
- Great error messages

**Cons:**
- Binary downloads (platform-specific)
- Code generation step
- Less control over queries

#### Drizzle (Code-First)
```typescript
// schema.ts
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
})

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
})
```

**Workflow:**
1. Define schema in TypeScript
2. Run `drizzle-kit push` → pushes to database directly
3. Use query builder (no generation)

**Pros:**
- Pure TypeScript (no binaries)
- No code generation
- More control over queries (closer to SQL)
- Lighter (~2MB vs Prisma's ~30MB)

**Cons:**
- Less mature ecosystem
- No GUI (yet)
- Migration history less clear
- More verbose queries

**Interview Question: "Which would you choose for a new project?"**

**Good Answer:**
> "It depends. For a team project or startup, I'd choose Prisma because the DX is better - migrations are managed, there's a GUI, and onboarding is easier. For a serverless edge function or a library, I'd choose Drizzle because it has no binary dependencies and smaller bundle size. For this project, Prisma was the right choice because I wanted a mature, well-documented ORM with good tooling."

---

## 5. Monorepo Architecture

### "Why did you use a monorepo?"

**Good Answer:**
> "I used a monorepo to share TypeScript types between frontend and backend without publishing packages to npm. The `packages/api` exports tRPC router types that `apps/web` imports directly using workspace protocol (`workspace:*`). This enables true end-to-end type safety - when I change an API type, TypeScript immediately shows errors in the frontend. It also simplified development - one `git clone`, one `pnpm install`, and everything works. The trade-off is more complex build orchestration, but tools like Turborepo can optimize that."

### How Workspace Protocol Works

**Root package.json:**
```json
{
  "name": "whatsapp-reminder-app",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

**Frontend package.json:**
```json
{
  "name": "web",
  "dependencies": {
    "@repo/api": "workspace:*",
    "@repo/db": "workspace:*"
  }
}
```

**What happens:**
- `pnpm install` symlinks `packages/api` → `node_modules/@repo/api`
- Frontend can `import { appRouter } from '@repo/api'`
- TypeScript resolves types through symlink
- **No npm publish needed**

### Monorepo vs Polyrepo

**Interview Question: "What are the trade-offs of monorepos?"**

| Aspect | Monorepo | Polyrepo |
|--------|----------|----------|
| **Code Sharing** | Easy (import directly) | Hard (publish to npm/registry) |
| **Versioning** | All packages in sync | Independent versioning |
| **Type Safety** | End-to-end | Requires publishing types |
| **CI/CD** | Complex (selective builds) | Simple (one repo = one deploy) |
| **Onboarding** | One clone, simpler | Multiple repos, more complex |
| **Scaling** | Can get slow (large repos) | Scales better (smaller repos) |
| **Refactoring** | Easy (atomic changes) | Hard (coordinate across repos) |

**Good Answer:**
> "Monorepos are great for projects where packages are tightly coupled and deployed together - like a frontend and its backend. Polyrepos are better when packages have independent lifecycles or different teams own them. For this project, monorepo was ideal because the frontend and backend are always deployed as a pair, and I wanted seamless type sharing."

---

## 6. Authentication & Security

### "How did you implement authentication?"

**Good Answer:**
> "I used JWT tokens with bcrypt password hashing. When a user registers, I hash their password with bcrypt's 10 salt rounds and store the hash. On login, I verify the password against the hash, then generate a JWT signed with a secret key and 7-day expiration. The frontend stores the token in localStorage and includes it in the Authorization header for protected requests. On the backend, I have a tRPC middleware that verifies the JWT and attaches user info to the context, which protected procedures can access."

### JWT Deep Dive

**Registration Flow:**
```typescript
// 1. Hash password
const hashedPassword = await bcrypt.hash(password, 10)

// 2. Store in database
const user = await db.user.create({
  data: { email, password: hashedPassword }
})

// 3. Generate JWT
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// 4. Return to client
return { token, user }
```

**Protected Request Flow:**
```typescript
// Frontend sends request with token
headers: {
  Authorization: `Bearer ${token}`
}

// Backend middleware extracts and verifies
const token = req.headers.authorization?.split(' ')[1]
const decoded = jwt.verify(token, process.env.JWT_SECRET)

// Attaches to context
ctx.user = { userId: decoded.userId, email: decoded.email }
```

### Security Considerations

**Interview Question: "What security issues did you consider?"**

**Good Answers:**

1. **Password Storage:**
   > "I never store plain-text passwords. bcrypt with 10 salt rounds makes brute-force attacks computationally expensive. I considered Argon2 (newer, more secure) but bcrypt is industry standard and well-tested."

2. **JWT Storage:**
   > "I store JWTs in localStorage. This is vulnerable to XSS attacks - if malicious JavaScript runs on my site, it can steal the token. The alternatives are httpOnly cookies (secure from XSS but vulnerable to CSRF) or memory-only storage (secure but lost on page refresh). For a portfolio project, localStorage is acceptable. In production, I'd use httpOnly cookies with CSRF tokens."

3. **Token Expiration:**
   > "7-day expiration balances security and UX. Shorter expiration is more secure but annoys users. In production, I'd implement refresh tokens - short-lived access tokens (15min) and longer-lived refresh tokens (30 days) stored in httpOnly cookies."

4. **SQL Injection:**
   > "Using an ORM like Prisma prevents SQL injection because it uses parameterized queries. I never concatenate user input into raw SQL."

5. **Input Validation:**
   > "All inputs are validated with Zod schemas before hitting the database. For example, emails must match email regex, passwords must be at least 8 characters, phone numbers must be E.164 format. This prevents injection attacks and ensures data integrity."

---

## 7. Deployment Challenges

### "You mentioned deployment challenges. What specifically went wrong?"

**Good Answer:**
> "I hit two main issues. First, Prisma requires downloading platform-specific binaries during client generation. On some serverless platforms, the build environment is Linux but runtime is different, causing binary mismatch. Second, SolidStart's SSR configuration with Vercel had edge cases - environment variables weren't loading correctly in the SSR context, and API routes had routing conflicts. With Next.js, these issues don't exist because Vercel is built specifically for Next.js. It was a valuable lesson about choosing mature, battle-tested tools when deployment is a priority."

**Technical Details:**

1. **Prisma Binary Issue:**
   ```bash
   # Build environment: Linux x64
   # Runtime environment: Alpine Linux (different libc)
   # Prisma downloads wrong binary → crashes at runtime
   ```

   **Solution options:**
   - Bundle Prisma binaries explicitly
   - Use Prisma Data Proxy (hosted)
   - Switch to Drizzle (no binaries)
   - Use Next.js (Vercel handles this correctly)

2. **Environment Variables in SSR:**
   ```typescript
   // Problem: process.env is undefined in browser context
   // SolidStart blurs server/client boundary

   // Solution: Load env vars explicitly in API routes
   import { config } from 'dotenv'
   config({ path: '.env' })
   ```

### Deployment Architecture (Planned)

**Interview Question: "How would you deploy this in production?"**

**Good Answer:**
> "I'd deploy the Next.js app to Vercel because it's optimized for Next.js - automatic deployments, edge functions, and environment variable management. The challenge is the background worker because Vercel functions have a 10-second timeout - not suitable for long-running cron jobs. I'd deploy the worker to Railway, which supports long-running processes. The worker would connect to the same production database (PostgreSQL on Vercel or Supabase). Both services would share environment variables for Twilio credentials and JWT secret."

**Architecture Diagram (Explain This):**
```
┌─────────────┐
│   Vercel    │
│  (Next.js)  │  ← User visits website
│  Frontend   │
│  +          │
│  API Routes │  ← tRPC endpoints
└──────┬──────┘
       │
       ├──────→ PostgreSQL (Vercel Postgres)
       │
┌──────┴──────┐
│   Railway   │
│ Background  │  ← Cron job (every 60s)
│   Worker    │  ← Checks for due reminders
│             │  ← Sends WhatsApp via Twilio
└──────┬──────┘
       │
       └──────→ PostgreSQL (same database)
```

---

## 8. Common Interview Questions

### Category 1: Technical Decisions

**Q: "Why TypeScript over JavaScript?"**

**A:**
> "TypeScript catches errors at compile time instead of runtime. In a full-stack app with complex data flows, type safety prevents bugs like passing wrong data shapes to API endpoints. It also serves as living documentation - I can see exactly what shape a function expects without reading docs. The trade-off is slower development initially, but the payoff is fewer runtime bugs and easier refactoring."

**Q: "Why SQLite in development and PostgreSQL in production?"**

**A:**
> "SQLite is perfect for local development - zero configuration, file-based, and Prisma handles migrations seamlessly. In production, I need PostgreSQL for better concurrency, JSON support, and compatibility with hosting platforms like Vercel. Prisma abstracts the differences, so my code works with both - I just change the connection string."

**Q: "What would you do differently if you started over?"**

**A:**
> "I'd start with Next.js instead of SolidJS to avoid migration time. However, the SolidJS detour taught me valuable concepts about reactivity and signals that I wouldn't have learned otherwise. I'd also add testing from day 1 - unit tests for tRPC routers and E2E tests with Playwright. And I'd implement proper error monitoring with Sentry before deploying."

---

### Category 2: Concepts & Trade-offs

**Q: "Explain the difference between Server Components and Client Components in Next.js"**

**A:**
> "Server Components render on the server and send HTML to the client - they never become interactive. They're great for data fetching because you can query databases directly without exposing API endpoints. Client Components are marked with 'use client' and hydrate into interactive components in the browser. The power is in composition - Server Components can render Client Components, so you can build mostly-static pages with islands of interactivity, minimizing JavaScript sent to users."

**Q: "What's the difference between SSR and SSG?"**

**A:**
> "SSR (Server-Side Rendering) renders HTML on-demand for each request - great for dynamic content like user dashboards. SSG (Static Site Generation) renders HTML at build time - perfect for marketing pages or blogs that don't change often. Next.js supports both, plus ISR (Incremental Static Regeneration) which is like SSG but re-generates pages on a schedule. My app uses SSR for the dashboard because content is user-specific."

**Q: "Why use a monorepo tool like pnpm workspaces instead of a monolith?"**

**A:**
> "A monolith is a single application. A monorepo is multiple packages in one repository. I could have built this as a monolith - one big Next.js app with API routes. But separating the API into a package means I could theoretically build multiple frontends (web, mobile, CLI) that all use the same API. It also enforces clear boundaries - the frontend can only import types from the API, not implementation details."

---

### Category 3: Scale & Production

**Q: "How would you handle 10,000 users sending reminders?"**

**A:**
> "The current architecture wouldn't scale. The worker uses node-cron to check every 60 seconds - at 10,000 users, database queries would get slow. I'd switch to a queue system like BullMQ with Redis. When a user creates a reminder, I'd schedule a job in the queue with a delay. At the scheduled time, the job worker picks it up and sends the WhatsApp message. This scales horizontally - I can add more workers. I'd also add database indexes on `scheduledFor` and `userId`, and implement pagination for the reminder list."

**Q: "What about security at scale?"**

**A:**
> "I'd add rate limiting on login endpoints to prevent brute force attacks - maybe 5 attempts per IP per minute using Redis. I'd implement refresh tokens instead of long-lived JWTs. I'd add input sanitization to prevent XSS attacks. I'd use environment variables with secrets management (Vercel env vars, AWS Secrets Manager). And I'd add monitoring with Sentry to catch and alert on errors in production."

**Q: "How would you make this production-ready?"**

**A:**
Checklist:
- [ ] Testing (unit, integration, E2E)
- [ ] Error monitoring (Sentry)
- [ ] Logging (structured logs with Pino)
- [ ] Rate limiting (on auth endpoints)
- [ ] Input sanitization (XSS prevention)
- [ ] Database indexes (performance)
- [ ] Caching (TanStack Query on frontend, Redis on backend)
- [ ] Monitoring (Vercel Analytics, Grafana)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Documentation (API docs, setup guide)
- [ ] Security headers (CSP, CORS, helmet)
- [ ] Backup strategy (database snapshots)

---

### Category 4: Learning & Growth

**Q: "What did you learn from this project?"**

**A:**
> "Three big lessons. First, framework-agnostic architecture is powerful - separating business logic from UI logic meant I could swap frameworks with 70% code reuse. Second, deployment matters early - I should have validated deployment before building features. Third, documentation accelerates development - maintaining a decision log helped me remember why I made choices and resume work after breaks."

**Q: "What would you add next?"**

**A:**
> "First, testing - I'd add Vitest for unit tests and Playwright for E2E tests. Second, I'd improve the UX with optimistic updates using TanStack Query mutations. Third, I'd add a feature like recurring reminders or location-based reminders to learn about cron expressions or geofencing. Long-term, I'd explore AI features - using OpenAI to generate reminder messages based on context."

---

## Study Plan

### Week 1: Core Concepts
- [ ] Read SolidJS docs (reactivity, signals, effects)
- [ ] Read React docs (Server Components, App Router)
- [ ] Read tRPC docs (procedures, context, middlewares)
- [ ] Watch: Theo Browne's tRPC videos

### Week 2: Deep Dives
- [ ] Build a small signal-based counter (understand reactivity)
- [ ] Build a small REST API vs tRPC comparison
- [ ] Read Prisma internals (how it generates client)
- [ ] Practice explaining trade-offs out loud

### Week 3: Interview Prep
- [ ] Practice common questions with a friend
- [ ] Record yourself explaining technical decisions
- [ ] Review this document daily
- [ ] Prepare 3-5 stories about challenges solved

---

## Quick Reference: Elevator Pitch

**30-second version:**
> "I built a full-stack WhatsApp reminder app to learn modern TypeScript patterns. I started with SolidJS to understand fine-grained reactivity and signals, then migrated to Next.js and React for better deployment and job market alignment. I used tRPC for end-to-end type safety without code generation, Prisma for type-safe database queries, and a monorepo to share types between frontend and backend. The interesting part was preserving 70% of my code during migration by keeping business logic framework-agnostic."

**2-minute version:**
> "This project demonstrates full-stack TypeScript development with modern tools. The backend uses tRPC, which gives me autocomplete and type checking for API calls without any code generation - if I rename a field on the backend, TypeScript immediately shows errors in the frontend. I use Prisma ORM for type-safe database queries with automatic migrations.

> I initially built this with SolidJS to learn fine-grained reactivity - a different mental model than React's virtual DOM. SolidJS uses signals, similar to Vue 3 or Svelte, where updates are direct DOM manipulations instead of reconciliation. I learned a lot about how reactive systems work at a fundamental level.

> I then migrated to Next.js and React because I hit deployment challenges with SolidStart and realized React dominates the job market. The migration was strategic - I architected the backend to be framework-agnostic, so 70% of my code (all business logic, API routes, database schema) worked unchanged. Only the UI layer needed rewriting.

> The project includes JWT authentication with bcrypt password hashing, WhatsApp integration via Twilio, and a background worker for scheduled message delivery. It's a monorepo using pnpm workspaces, which lets me share TypeScript types between packages without publishing to npm. Next steps are deploying to Vercel, adding tests with Vitest and Playwright, and potentially adding AI features with OpenAI."

---

**Remember:**
- Be honest about what you learned vs what you built
- Emphasize the "why" behind decisions, not just the "what"
- Show growth mindset (what you'd do differently)
- Connect technical choices to business value
- Admit trade-offs (every choice has pros/cons)

Good luck! 🚀
