# 📚 WhatsApp Reminder App - Complete Learning Guide

> A deep dive into all concepts, patterns, and technologies used in this full-stack TypeScript application

**Last Updated:** November 13, 2025
**Target Audience:** Developers learning modern full-stack development

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Monorepo with pnpm Workspaces](#monorepo-with-pnpm-workspaces)
3. [TypeScript Configuration & Project References](#typescript-configuration--project-references)
4. [Drizzle ORM - Type-Safe Database](#drizzle-orm---type-safe-database)
5. [tRPC - End-to-End Type Safety](#trpc---end-to-end-type-safety)
6. [Authentication System](#authentication-system)
7. [SolidJS & SolidStart](#solidjs--solidstart)
8. [API Design Patterns](#api-design-patterns)
9. [Security Best Practices](#security-best-practices)
10. [Development Workflow](#development-workflow)

---

## 1. Architecture Overview

### What is This Architecture?

This project uses a **monorepo** architecture with three main packages:

```
whatsapp-reminder-app/
├── packages/
│   ├── db/       ← Database layer (Drizzle ORM + SQLite)
│   └── api/      ← Backend logic (tRPC routers + business logic)
└── apps/
    └── web/      ← Frontend (SolidStart + UI)
```

### Why This Structure?

**Problem:** Traditional multi-repo setups require:
- Separate git repositories for frontend/backend
- Manual version synchronization
- Duplicated type definitions
- Complex deployment coordination

**Solution:** Monorepo with shared workspace packages
- ✅ Single source of truth for types
- ✅ One `git clone`, one `pnpm install`
- ✅ Refactor safely across entire stack
- ✅ Deploy packages independently

### Key Architectural Decisions

| Decision | Why? | Trade-off |
|----------|------|-----------|
| **Drizzle ORM** over Prisma | No binary downloads, pure JS | Smaller ecosystem |
| **libSQL** over better-sqlite3 | No native binaries, works everywhere | Slightly slower |
| **tRPC** over REST | Type safety without code generation | Requires TypeScript |
| **SolidJS** over React | Better performance, true reactivity | Smaller community |
| **Monorepo** over Multi-repo | Shared types, easier refactoring | More complex setup |

---

## 2. Monorepo with pnpm Workspaces

### What is pnpm?

**pnpm** (Performant npm) is a fast, disk-efficient package manager that uses hard links and symlinks to save disk space.

**Key Concepts:**

```bash
# Traditional npm duplicates packages
node_modules/
├── package-a/
│   └── node_modules/lodash/  ← Copy 1
└── package-b/
    └── node_modules/lodash/  ← Copy 2 (duplicate!)

# pnpm uses a global store with links
node_modules/
├── .pnpm/
│   └── lodash@4.17.21/       ← Single copy
├── package-a/ → symlink
└── package-b/ → symlink
```

### Workspace Configuration

**File:** `pnpm-workspace.yaml`
```yaml
packages:
  - 'packages/*'  # All packages in packages/ directory
  - 'apps/*'      # All apps in apps/ directory
```

This tells pnpm to treat each subdirectory as a separate package that can depend on each other.

### Workspace Dependencies

**In `apps/web/package.json`:**
```json
{
  "dependencies": {
    "@repo/api": "workspace:*"  // ← Special syntax for local packages
  }
}
```

**What `workspace:*` means:**
- **workspace:** = Link to local package (not npm registry)
- **\*** = Use whatever version is in the workspace

**Benefits:**
1. Changes in `@repo/api` are instantly available in `web` app
2. No need to publish to npm during development
3. TypeScript IntelliSense works across packages

### Common pnpm Workspace Commands

```bash
# Install dependencies for all packages
pnpm install

# Run script in specific package
pnpm --filter @repo/db studio
pnpm --filter web dev

# Run script in all packages
pnpm -r build  # Recursive

# Add dependency to specific package
pnpm --filter web add solid-js
```

### Deep Dive: How Workspaces Enable Type Safety

```typescript
// packages/api/src/index.ts
export const appRouter = router({
  auth: authRouter,
  reminder: reminderRouter,
})
export type AppRouter = typeof appRouter  // ← Export TYPE, not value

// apps/web/src/lib/trpc.ts
import type { AppRouter } from '@repo/api'  // ← Import type from workspace
export const trpc = createTRPCProxyClient<AppRouter>({...})
```

**Magic here:**
1. API package exports TypeScript **type** (zero runtime cost)
2. Web app imports that type via workspace link
3. tRPC uses type to generate type-safe client
4. Result: Autocomplete + type checking for all API calls!

---

## 3. TypeScript Configuration & Project References

### What are Project References?

Project References let you structure large TypeScript codebases as smaller sub-projects that build independently.

**Root `tsconfig.json`:**
```json
{
  "references": [
    { "path": "./packages/db" },
    { "path": "./packages/api" },
    { "path": "./apps/web" }
  ],
  "files": []  // Root doesn't compile anything
}
```

**Each package's `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "composite": true,        // ← Required for project references
    "incremental": true,      // Save compilation info for faster rebuilds
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Benefits of Project References

**Without Project References:**
```
[Building entire codebase...]  ← 30 seconds
[Change one file in db package]
[Rebuilding entire codebase...] ← Another 30 seconds
```

**With Project References:**
```
[Building db package...]  ← 5 seconds
[Change one file in db package]
[Rebuilding only db package...] ← 2 seconds
[api package sees updated types automatically]
```

### Key TypeScript Settings Explained

```json
{
  "compilerOptions": {
    // Type Checking
    "strict": true,              // Enable all strict checks
    "noUncheckedIndexedAccess": true,  // array[0] → string | undefined

    // Module Resolution
    "moduleResolution": "bundler",  // Modern module resolution
    "module": "ESNext",             // Use latest ES modules
    "target": "ES2022",             // Compile to modern JS

    // Interop
    "esModuleInterop": true,        // Allow default imports from CJS
    "allowSyntheticDefaultImports": true,

    // Type Imports
    "verbatimModuleSyntax": true,   // Preserve import type syntax

    // Output
    "declaration": true,            // Generate .d.ts files
    "declarationMap": true,         // Generate .d.ts.map for jump-to-definition
    "sourceMap": true               // Generate .js.map for debugging
  }
}
```

### Path Mapping for Clean Imports

**Without path mapping:**
```typescript
import { db } from '../../../packages/db/src/index'  // 😢
```

**With path mapping in `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@repo/db": ["./packages/db/src/index.ts"],
      "@repo/api": ["./packages/api/src/index.ts"]
    }
  }
}
```

**Result:**
```typescript
import { db } from '@repo/db'  // 😎
```

---

## 4. Drizzle ORM - Type-Safe Database

### What is an ORM?

**ORM** (Object-Relational Mapping) = Translate between database tables and JavaScript objects

**Without ORM:**
```typescript
const result = await db.execute(
  'SELECT * FROM users WHERE email = ?',
  [email]
)
// result is any[] - no type safety!
```

**With Drizzle ORM:**
```typescript
const user = await db.select()
  .from(users)
  .where(eq(users.email, email))
// user is User[] - fully typed!
```

### Why Drizzle Over Prisma?

| Feature | Drizzle | Prisma |
|---------|---------|--------|
| **Type Safety** | ✅ Full | ✅ Full |
| **Binary Downloads** | ❌ No (pure JS) | ✅ Yes (can fail) |
| **Schema Definition** | TypeScript | Custom DSL |
| **Bundle Size** | ~50KB | ~500KB |
| **Runtime Overhead** | Minimal | Higher |
| **Migrations** | SQL or Push | Custom format |

**Key Difference:**
- **Prisma:** Generate TypeScript types from schema file
- **Drizzle:** Schema IS TypeScript, types inferred directly

### Schema Definition Deep Dive

**File:** `packages/db/src/schema.ts`

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// Define table structure
export const users = sqliteTable('users', {
  id: text('id')                    // Column type
    .primaryKey()                   // Constraint
    .$defaultFn(() => crypto.randomUUID()),  // Default value function

  email: text('email')
    .notNull()                      // NOT NULL constraint
    .unique(),                      // UNIQUE constraint

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

// Infer TypeScript types from schema
export type User = typeof users.$inferSelect
// → { id: string, email: string, createdAt: Date }

export type NewUser = typeof users.$inferInsert
// → { id?: string, email: string, createdAt?: Date }
```

**Key Concepts:**

1. **Column Types:**
   - `text()` → STRING in DB, `string` in TypeScript
   - `integer()` → INTEGER in DB, `number` in TypeScript
   - `integer({mode: 'timestamp'})` → INTEGER in DB, `Date` in TypeScript
   - `integer({mode: 'boolean'})` → INTEGER (0/1) in DB, `boolean` in TypeScript

2. **Constraints:**
   - `.notNull()` → Required in TypeScript type
   - `.primaryKey()` → Ensures uniqueness
   - `.unique()` → Creates unique index
   - `.references(() => table.column)` → Foreign key

3. **Type Inference:**
   ```typescript
   // $inferSelect = Shape when reading from DB
   type User = typeof users.$inferSelect
   // { id: string, email: string, createdAt: Date }

   // $inferInsert = Shape when inserting into DB
   type NewUser = typeof users.$inferInsert
   // { id?: string, email: string, createdAt?: Date }
   // Notice id and createdAt are optional (have defaults)
   ```

### Query Building

**Select Query:**
```typescript
// Get all users
const allUsers = await db.select().from(users)

// Select specific columns
const emails = await db.select({
  email: users.email,
  id: users.id
}).from(users)

// Where clause
import { eq } from 'drizzle-orm'
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'test@example.com'))
  .limit(1)
```

**Insert Query:**
```typescript
const [newUser] = await db.insert(users)
  .values({
    email: 'new@example.com',
    password: hashedPassword,
    phoneNumber: '+1234567890'
  })
  .returning()  // Return the created row

// TypeScript ensures all required fields are provided!
```

**Update Query:**
```typescript
await db.update(users)
  .set({ phoneNumber: '+9876543210' })
  .where(eq(users.id, userId))
```

**Delete Query:**
```typescript
await db.delete(users)
  .where(eq(users.id, userId))
```

### Relationships and Joins

**Foreign Key Definition:**
```typescript
export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // ↑ If user is deleted, delete their reminders too
})
```

**Join Query:**
```typescript
const remindersWithUsers = await db
  .select({
    reminder: reminders,
    user: users
  })
  .from(reminders)
  .leftJoin(users, eq(reminders.userId, users.id))
```

### Migration Workflow

**Development (Push Schema):**
```bash
pnpm --filter @repo/db exec drizzle-kit push
```
- Reads `src/schema.ts`
- Compares with current database
- Applies changes immediately
- ⚠️ Can lose data (drops columns)

**Production (Migrations):**
```bash
# Generate migration file
pnpm --filter @repo/db exec drizzle-kit generate

# Creates: drizzle/0001_migration.sql
# Contains: ALTER TABLE statements

# Apply migrations
pnpm --filter @repo/db exec drizzle-kit migrate
```

### libSQL vs better-sqlite3

**Why we switched to libSQL:**

```typescript
// better-sqlite3 - Native binary (node-gyp)
import Database from 'better-sqlite3'
const sqlite = new Database('./dev.db')
// ❌ Requires compilation for your OS
// ❌ Fails in some environments (Docker, Sandboxes)

// libSQL - Pure JavaScript
import { createClient } from '@libsql/client'
const client = createClient({ url: 'file:./dev.db' })
// ✅ Works everywhere
// ✅ No compilation needed
// ✅ Can use remote Turso databases
```

---

## 5. tRPC - End-to-End Type Safety

### What is tRPC?

**tRPC** = TypeScript Remote Procedure Call

**Traditional REST API:**
```typescript
// Backend (api.ts)
app.post('/api/users', (req, res) => {
  const { email, password } = req.body  // any type
  // ... create user
})

// Frontend (app.tsx)
const response = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
const data = await response.json()  // any type
// ❌ No type safety
// ❌ No autocomplete
// ❌ Runtime errors if API changes
```

**With tRPC:**
```typescript
// Backend (api/src/routers/auth.ts)
export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      // input is typed as { email: string, password: string }
      return { userId: '123', token: 'abc' }
    })
})

// Frontend (web/src/app.tsx)
const result = await trpc.auth.register.mutate({
  email: 'test@example.com',
  password: 'secure123'
})
// result is typed as { userId: string, token: string }
// ✅ Full type safety
// ✅ Autocomplete works
// ✅ Compile error if API changes
```

### Core Concepts

#### 1. Procedures

**Procedures** = API endpoints in tRPC

```typescript
import { router, publicProcedure } from './trpc'

export const myRouter = router({
  // Query = GET request (fetch data)
  getUser: publicProcedure.query(async () => {
    return { name: 'John' }
  }),

  // Mutation = POST/PUT/DELETE (modify data)
  createUser: publicProcedure.mutation(async () => {
    return { id: '123' }
  })
})
```

**When to use query vs mutation:**
- **Query:** Reading data, idempotent (can be called multiple times safely)
- **Mutation:** Changing data, side effects (creates/updates/deletes)

#### 2. Input Validation with Zod

**Zod** = TypeScript-first schema validation

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),                    // Must be valid email
  password: z.string().min(8),                  // Min 8 characters
  age: z.number().min(18).optional(),           // Optional, but if provided >= 18
  phoneNumber: z.string().regex(/^\+[0-9]+$/)   // Must match pattern
})

// Infer TypeScript type from schema
type UserInput = z.infer<typeof userSchema>
// { email: string, password: string, age?: number, phoneNumber: string }
```

**Using with tRPC:**
```typescript
export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      // Zod validates input before this runs
      // If invalid, throws error automatically
      // If valid, input is typed correctly
    })
})
```

**Common Zod Validations:**
```typescript
z.string()              // Any string
z.string().min(5)       // Min length
z.string().max(100)     // Max length
z.string().email()      // Valid email
z.string().url()        // Valid URL
z.string().uuid()       // Valid UUID
z.string().regex(/^[A-Z]/)  // Custom pattern

z.number()              // Any number
z.number().int()        // Integer only
z.number().positive()   // > 0
z.number().min(0).max(100)  // Range

z.boolean()             // true or false
z.date()                // Date object
z.enum(['a', 'b', 'c']) // One of these values

z.array(z.string())     // Array of strings
z.object({ key: z.string() })  // Object shape

z.string().optional()   // string | undefined
z.string().nullable()   // string | null
z.string().default('hi') // Use default if missing
```

#### 3. Context

**Context** = Data available to all procedures

```typescript
// packages/api/src/context.ts
export async function createContext(opts: { headers: Headers }) {
  const token = getTokenFromHeader(opts.headers)
  const user = decodeUser(token)

  return {
    db,    // Database client
    user,  // Authenticated user (or null)
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
```

**Using context in procedures:**
```typescript
export const reminderRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // ctx.user exists (guaranteed by protectedProcedure)
    // ctx.db is available
    return await ctx.db.select()
      .from(reminders)
      .where(eq(reminders.userId, ctx.user.userId))
  })
})
```

#### 4. Middleware

**Middleware** = Code that runs before procedures

```typescript
// packages/api/src/trpc.ts
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // Add user to context for next steps
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // TypeScript now knows user exists
    },
  })
})

// Create protected procedure using middleware
export const protectedProcedure = t.procedure.use(isAuthenticated)
```

**Middleware execution order:**
```
Request → Context Creation → Middleware 1 → Middleware 2 → Procedure
```

#### 5. Router Composition

**Split routers by feature:**
```typescript
// packages/api/src/routers/auth.ts
export const authRouter = router({
  register: publicProcedure.mutation(...),
  login: publicProcedure.mutation(...),
  me: protectedProcedure.query(...)
})

// packages/api/src/routers/reminder.ts
export const reminderRouter = router({
  list: protectedProcedure.query(...),
  create: protectedProcedure.mutation(...)
})

// packages/api/src/index.ts
export const appRouter = router({
  auth: authRouter,       // All auth routes under /api/trpc/auth.*
  reminder: reminderRouter // All reminder routes under /api/trpc/reminder.*
})
```

**Frontend usage:**
```typescript
await trpc.auth.register.mutate({...})     // POST /api/trpc/auth.register
await trpc.auth.login.mutate({...})        // POST /api/trpc/auth.login
await trpc.reminder.list.query()           // GET /api/trpc/reminder.list
await trpc.reminder.create.mutate({...})   // POST /api/trpc/reminder.create
```

### tRPC Client Setup

**File:** `apps/web/src/lib/trpc.ts`

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@repo/api'

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers() {
        // Add auth token to every request
        const token = localStorage.getItem('auth_token')
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})
```

**What's happening:**
1. `createTRPCProxyClient<AppRouter>` creates a type-safe client
2. `httpBatchLink` batches multiple requests into one HTTP call
3. `headers()` function adds authentication to every request
4. Result: `trpc` object with autocomplete for all routes

### Error Handling

**Backend:**
```typescript
import { TRPCError } from '@trpc/server'

export const authRouter = router({
  login: publicProcedure
    .input(...)
    .mutation(async ({ input }) => {
      const user = await db.select()...

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        })
      }

      return { token: '...' }
    })
})
```

**Frontend:**
```typescript
try {
  const result = await trpc.auth.login.mutate({ email, password })
  console.log('Success:', result)
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    alert('Invalid email or password')
  } else {
    alert('Something went wrong')
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Not logged in / invalid credentials
- `FORBIDDEN` - Logged in but not allowed
- `NOT_FOUND` - Resource doesn't exist
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Something broke

---

## 6. Authentication System

### Overview

This project uses **JWT (JSON Web Tokens)** for authentication.

**Flow:**
```
1. User registers/logs in
2. Server creates JWT containing userId + email
3. Server sends JWT to client
4. Client stores JWT in localStorage
5. Client includes JWT in Authorization header for future requests
6. Server verifies JWT and extracts user info
```

### Password Hashing with bcrypt

**Why hash passwords?**

```
Database gets hacked:
❌ Plaintext: password123 → Hacker has your password!
✅ Hashed: $2b$10$xyzabc... → Hacker has gibberish!
```

**How bcrypt works:**
```typescript
import bcrypt from 'bcrypt'

// Hash password when user registers
const hash = await bcrypt.hash('password123', 10)
// Result: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
//         ^^^^ ^^  ^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         algo rounds       salt                      hash

// Verify password when user logs in
const match = await bcrypt.compare('password123', hash)
// true if correct, false if wrong
```

**Key Concepts:**
- **Salt:** Random data added before hashing (prevents rainbow table attacks)
- **Rounds:** Number of times to hash (10 = 2^10 = 1024 iterations)
- **One-way:** Can't reverse the hash to get original password

**Implementation:**
```typescript
// packages/api/src/lib/auth.ts
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### JWT (JSON Web Tokens)

**What is a JWT?**

A JWT is three base64-encoded strings separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MTYyMzkwMjJ9.4vO3-sNzBxRzRRiR6TGjqXk0kVOoP5DU7WJLAYJzDMo
├─────────────────────────────────────┤├──────────────────────────────────────────────────────────────────────────────────┤├────────────────────────────────────┤
         HEADER                                                    PAYLOAD                                                          SIGNATURE
```

**Decoded:**
```json
// HEADER
{
  "alg": "HS256",  // Algorithm
  "typ": "JWT"     // Type
}

// PAYLOAD (your data)
{
  "userId": "123",
  "email": "test@example.com",
  "iat": 1616239022,  // Issued at timestamp
  "exp": 1616843822   // Expiration timestamp
}

// SIGNATURE (proves it wasn't tampered with)
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
)
```

**How JWT authentication works:**

```typescript
// 1. User logs in successfully
const token = jwt.sign(
  { userId: user.id, email: user.email },  // Payload
  process.env.JWT_SECRET,                  // Secret key
  { expiresIn: '7d' }                      // Options
)
// Returns: "eyJhbGci..."

// 2. Client stores token
localStorage.setItem('auth_token', token)

// 3. Client sends token with requests
fetch('/api/trpc/reminder.list', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// 4. Server verifies token
const payload = jwt.verify(token, process.env.JWT_SECRET)
// If valid: { userId: '123', email: 'test@example.com', ... }
// If invalid/expired: throws error
```

**Implementation:**
```typescript
// packages/api/src/lib/auth.ts
export function signJwt(payload: { userId: string; email: string }): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing JWT_SECRET')
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyJwt(token: string): { userId: string } | null {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing JWT_SECRET')
  try {
    const payload = jwt.verify(token, secret) as { userId?: string }
    return payload.userId ? { userId: payload.userId } : null
  } catch {
    return null  // Invalid or expired token
  }
}
```

### Authentication Flow in tRPC

**1. Create context with user info:**
```typescript
// packages/api/src/context.ts
export async function createContext(opts: { headers: Headers }) {
  // Extract token from "Authorization: Bearer <token>" header
  const token = getTokenFromHeader(opts.headers)

  // Decode and verify token
  const user = decodeUser(token)

  return {
    db,
    user  // { userId: '123', email: 'test@example.com' } or null
  }
}
```

**2. Protect routes with middleware:**
```typescript
// packages/api/src/trpc.ts
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})

export const protectedProcedure = t.procedure.use(isAuthenticated)
```

**3. Use protected procedures:**
```typescript
// packages/api/src/routers/reminder.ts
export const reminderRouter = router({
  list: protectedProcedure  // ← Only authenticated users
    .query(async ({ ctx }) => {
      // ctx.user is guaranteed to exist here
      return await ctx.db.select()
        .from(reminders)
        .where(eq(reminders.userId, ctx.user.userId))
    })
})
```

### Security Best Practices

**1. Never store passwords in plaintext**
```typescript
❌ password: 'password123'
✅ password: '$2b$10$N9qo8uLOickgx...'
```

**2. Use HTTPS in production**
```
❌ http://example.com  → Tokens sent in plaintext
✅ https://example.com → Tokens encrypted in transit
```

**3. Set JWT expiration**
```typescript
jwt.sign(payload, secret, { expiresIn: '7d' })  // Token expires after 7 days
```

**4. Validate JWT secret exists**
```typescript
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required!')
}
```

**5. Use secure random secrets**
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# 221559ea4bdaddcfbca73ab71d5bf563e267f1a92775aea06e69c80b3f97f28b
```

**6. Implement rate limiting (future)**
```typescript
// Prevent brute force attacks
const loginAttempts = new Map()
if (loginAttempts.get(email) > 5) {
  throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
}
```

---

## 7. SolidJS & SolidStart

### What is SolidJS?

**SolidJS** is a reactive JavaScript framework similar to React, but with key differences:

**React:**
```jsx
function Counter() {
  const [count, setCount] = useState(0)

  // Entire function re-runs on every state change
  console.log('Component rendered')

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**SolidJS:**
```jsx
function Counter() {
  const [count, setCount] = createSignal(0)

  // Function runs ONCE
  console.log('Component created')

  // Only this part updates when count changes
  return <button onClick={() => setCount(count() + 1)}>{count()}</button>
}
```

**Key Differences:**

| Concept | React | SolidJS |
|---------|-------|---------|
| **Rendering** | Re-renders component | Updates specific DOM nodes |
| **State** | `useState` | `createSignal` |
| **Effects** | `useEffect` | `createEffect` |
| **Memoization** | `useMemo` | `createMemo` |
| **Virtual DOM** | Yes | No (direct DOM updates) |
| **Bundle Size** | ~40KB | ~7KB |

### Signals (Reactive State)

**Basic Usage:**
```typescript
import { createSignal } from 'solid-js'

const [count, setCount] = createSignal(0)

// Read signal (call it like a function)
console.log(count())  // 0

// Write signal
setCount(1)
console.log(count())  // 1

// Update based on previous value
setCount(prev => prev + 1)
console.log(count())  // 2
```

**Signals in JSX:**
```jsx
function App() {
  const [name, setName] = createSignal('World')

  return (
    <div>
      <h1>Hello {name()}!</h1>
      {/* ↑ Automatically re-renders when name changes */}

      <input
        value={name()}
        onInput={(e) => setName(e.target.value)}
      />
    </div>
  )
}
```

### Effects (Side Effects)

**createEffect** runs when signals it uses change:
```typescript
import { createSignal, createEffect } from 'solid-js'

const [count, setCount] = createSignal(0)

createEffect(() => {
  console.log('Count is now:', count())
  // This runs whenever count() changes
})

setCount(1)  // Logs: "Count is now: 1"
setCount(2)  // Logs: "Count is now: 2"
```

**Common use case: API calls**
```typescript
const [userId, setUserId] = createSignal(null)
const [user, setUser] = createSignal(null)

createEffect(async () => {
  const id = userId()
  if (id) {
    const userData = await fetch(`/api/users/${id}`).then(r => r.json())
    setUser(userData)
  }
})
```

### Computed Values (Memos)

**createMemo** caches expensive computations:
```typescript
import { createSignal, createMemo } from 'solid-js'

const [numbers, setNumbers] = createSignal([1, 2, 3, 4, 5])

// Without memo: Recalculates every time component updates
const sum = () => numbers().reduce((a, b) => a + b, 0)

// With memo: Only recalculates when numbers() changes
const sum = createMemo(() => numbers().reduce((a, b) => a + b, 0))
```

### SolidStart (Meta-Framework)

**SolidStart** is to SolidJS what Next.js is to React:

- **File-based routing** (`/routes/about.tsx` → `/about`)
- **Server-side rendering** (SSR)
- **API routes** (`/routes/api/[...].ts`)
- **Build optimization**

**File Structure:**
```
apps/web/src/
├── routes/
│   ├── index.tsx              → / (homepage)
│   ├── about.tsx              → /about
│   ├── auth/
│   │   ├── login.tsx          → /auth/login
│   │   └── register.tsx       → /auth/register
│   └── api/
│       └── trpc/[trpc].ts     → /api/trpc/* (API handler)
├── components/
│   └── Button.tsx             → Reusable components
└── app.tsx                    → Root component
```

**Route Example:**
```jsx
// apps/web/src/routes/about.tsx
export default function About() {
  return <h1>About Page</h1>
}
// Automatically available at http://localhost:3000/about
```

**Dynamic Routes:**
```jsx
// apps/web/src/routes/users/[id].tsx
import { useParams } from '@solidjs/router'

export default function UserProfile() {
  const params = useParams()

  return <h1>User ID: {params.id}</h1>
  // /users/123 → "User ID: 123"
}
```

**API Routes:**
```typescript
// apps/web/src/routes/api/hello.ts
import type { APIEvent } from '@solidjs/start/server'

export async function GET(event: APIEvent) {
  return new Response(JSON.stringify({ message: 'Hello!' }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

---

## 8. API Design Patterns

### RESTful Naming Conventions

Although we use tRPC (not REST), our procedure names follow REST principles:

```typescript
// Good naming
router({
  list: procedure.query(...)      // GET /reminders
  byId: procedure.query(...)      // GET /reminders/:id
  create: procedure.mutation(...) // POST /reminders
  update: procedure.mutation(...) // PUT /reminders/:id
  delete: procedure.mutation(...) // DELETE /reminders/:id
})

// Avoid
router({
  getAllReminders: procedure.query(...)
  getReminderById: procedure.query(...)
  // Redundant "get" prefix
})
```

### Input Validation Patterns

**Always validate at API boundary:**
```typescript
// ❌ Bad: Validate in database layer
export const reminderRouter = router({
  create: protectedProcedure
    .mutation(async ({ input }) => {
      if (!input.title) throw new Error('Title required')
      // Validation scattered throughout code
    })
})

// ✅ Good: Validate with Zod at entry point
export const reminderRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      message: z.string().min(1)
    }))
    .mutation(async ({ input }) => {
      // input is guaranteed valid here
    })
})
```

### Error Handling Patterns

**Throw descriptive errors:**
```typescript
// ❌ Generic error
throw new Error('Error')

// ✅ Specific error with code
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Reminder not found'
})
```

**Verify ownership before operations:**
```typescript
export const reminderRouter = router({
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if reminder belongs to user
      const [reminder] = await ctx.db.select()
        .from(reminders)
        .where(and(
          eq(reminders.id, input.id),
          eq(reminders.userId, ctx.user.userId)
        ))

      if (!reminder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reminder not found or not authorized'
        })
      }

      await ctx.db.delete(reminders).where(eq(reminders.id, input.id))
    })
})
```

### Pagination Pattern

**For large datasets:**
```typescript
export const reminderRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input, ctx }) => {
      const items = await ctx.db.select()
        .from(reminders)
        .where(eq(reminders.userId, ctx.user.userId))
        .limit(input.limit)
        .offset(input.offset)

      return { items, nextOffset: input.offset + input.limit }
    })
})
```

---

## 9. Security Best Practices

### Environment Variables

**Never commit secrets:**
```bash
# .env (gitignored)
JWT_SECRET=221559ea4bdaddcfbca73ab71d5bf563e267f1a92775aea06e69c80b3f97f28b
TWILIO_AUTH_TOKEN=your_secret_token

# .env.example (committed)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
TWILIO_AUTH_TOKEN=your_auth_token_here
```

**Validate env vars at startup:**
```typescript
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}
```

### SQL Injection Prevention

**Drizzle ORM protects against SQL injection:**
```typescript
// ❌ Vulnerable (if using raw SQL)
await db.execute(
  `SELECT * FROM users WHERE email = '${email}'`
)
// If email = "'; DROP TABLE users; --"
// SQL becomes: SELECT * FROM users WHERE email = ''; DROP TABLE users; --'

// ✅ Safe (parameterized query)
await db.select().from(users).where(eq(users.email, email))
// Drizzle escapes parameters automatically
```

### XSS (Cross-Site Scripting) Prevention

**SolidJS escapes output by default:**
```jsx
const [name, setName] = createSignal('<script>alert("XSS")</script>')

// ✅ Safe: Rendered as text, not executed
<div>{name()}</div>
// Output: &lt;script&gt;alert("XSS")&lt;/script&gt;

// ❌ Dangerous: innerHTML executes scripts
<div innerHTML={name()} />
```

### CSRF (Cross-Site Request Forgery) Prevention

**tRPC with custom headers is CSRF-resistant:**
```typescript
// Simple requests (GET, HEAD) are protected by CORS
// Complex requests (POST with JSON) require preflight (OPTIONS)

// Browsers won't send custom headers from malicious sites
fetch('https://yoursite.com/api/trpc', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token'  // ← Custom header
  }
})
// Attacker can't forge this from evil.com
```

### Rate Limiting

**Future implementation:**
```typescript
import { TRPCError } from '@trpc/server'

const rateLimiter = new Map<string, number[]>()

const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const ip = ctx.req.ip
  const now = Date.now()
  const windowMs = 60 * 1000  // 1 minute
  const maxRequests = 100

  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, [])
  }

  const requests = rateLimiter.get(ip)!
    .filter(time => now - time < windowMs)

  if (requests.length >= maxRequests) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded'
    })
  }

  requests.push(now)
  rateLimiter.set(ip, requests)

  return next()
})
```

---

## 10. Development Workflow

### Local Development

**Start development server:**
```bash
pnpm dev
# Opens http://localhost:3000
```

**What happens:**
1. Vite dev server starts (instant HMR)
2. SolidStart SSR enabled
3. tRPC API routes available at `/api/trpc`
4. Database at `packages/db/data/dev.db`

**Hot Module Replacement (HMR):**
- Change any `.tsx` file → Browser updates instantly
- Change API route → Server restarts automatically
- No manual refreshes needed!

### TypeScript Workflow

**Check types across all packages:**
```bash
# Check without building
pnpm -r exec tsc --noEmit

# Build all packages
pnpm -r build
```

**Fix common TypeScript errors:**

**Error: "Cannot find module '@repo/db'"**
```bash
# Build the db package first
pnpm --filter @repo/db exec tsc
```

**Error: "Property does not exist on type"**
```typescript
// Add non-null assertion if you're sure it exists
const user = users[0]!

// Or check explicitly
const user = users[0]
if (!user) throw new Error('User not found')
```

### Database Workflow

**Push schema changes (development):**
```bash
pnpm --filter @repo/db push
```

**Open database studio:**
```bash
pnpm --filter @repo/db studio
# Opens visual database browser at http://localhost:4983
```

**Reset database:**
```bash
rm packages/db/data/dev.db
pnpm --filter @repo/db push
```

### Git Workflow

**Commit frequently:**
```bash
git add .
git commit -m "feat: add reminder CRUD operations"
git push
```

**Conventional Commits:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructure (no behavior change)
- `docs:` Documentation
- `chore:` Maintenance (deps, config)

### Debugging Tips

**Console logging in tRPC:**
```typescript
export const reminderRouter = router({
  create: protectedProcedure
    .mutation(async ({ input, ctx }) => {
      console.log('Creating reminder:', input)
      console.log('User:', ctx.user)

      const result = await ctx.db.insert(reminders).values(input)
      console.log('Created:', result)

      return result
    })
})
```

**Network tab debugging:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Click on `trpc` request
5. View request payload and response

**Database debugging:**
```typescript
// Enable query logging
export const db = drizzle(client, {
  schema,
  logger: true  // ← Logs all SQL queries
})
```

---

## Key Takeaways

### What Makes This Stack Special?

1. **End-to-End Type Safety**
   - Change backend type → Frontend immediately shows error
   - Refactor with confidence
   - Catch bugs at compile time

2. **Developer Experience**
   - Single `pnpm install` for entire stack
   - Hot reload everywhere
   - Autocomplete for everything
   - Minimal boilerplate

3. **Performance**
   - SolidJS: Fast fine-grained reactivity
   - Drizzle: Minimal overhead ORM
   - tRPC: Efficient batched requests
   - pnpm: Fast installs & minimal disk usage

4. **Modern Best Practices**
   - Monorepo for code sharing
   - Type-safe database queries
   - Secure authentication
   - Input validation everywhere

### What to Learn Next?

1. **Testing**
   - Unit tests with Vitest
   - Integration tests for API
   - E2E tests with Playwright

2. **Deployment**
   - Vercel for frontend + serverless API
   - Railway for background jobs
   - Turso for hosted SQLite

3. **Advanced Features**
   - Real-time subscriptions (WebSockets)
   - File uploads (S3/Cloudflare R2)
   - Background jobs (BullMQ)
   - Caching (Redis)

4. **Optimization**
   - Code splitting
   - Image optimization
   - Database indexing
   - Query optimization

---

## Resources

### Official Documentation

- **TypeScript:** https://www.typescriptlang.org/docs/
- **pnpm:** https://pnpm.io/
- **Drizzle ORM:** https://orm.drizzle.team/docs/overview
- **tRPC:** https://trpc.io/docs
- **SolidJS:** https://www.solidjs.com/docs
- **SolidStart:** https://start.solidjs.com/
- **Zod:** https://zod.dev/

### Learning Paths

**Complete Beginner:**
1. Learn TypeScript basics
2. Build simple Solid app
3. Understand databases (SQL)
4. Add tRPC for type-safe APIs

**Familiar with React:**
1. Read SolidJS docs (note differences)
2. Learn signals vs useState
3. Try createEffect vs useEffect
4. Build a small Solid project

**Backend Developer:**
1. Learn TypeScript
2. Understand Drizzle ORM
3. Build tRPC API
4. Add authentication

**Frontend Developer:**
1. Understand monorepos
2. Learn tRPC client setup
3. Integrate with SolidJS
4. Handle auth tokens

---

**Questions or Improvements?**

Open an issue or submit a PR on GitHub!

**Happy Learning! 🚀**
