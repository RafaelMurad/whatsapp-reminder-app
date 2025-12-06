# Migration Learnings: SolidJS → React/Next.js

**Purpose:** Detailed technical concepts learned during migration. Reference material for interviews and future projects.

**Audience:** Future me, interviewers, other developers migrating frameworks.

---

## Table of Contents

1. [SolidJS Signals vs React Hooks](#solidjs-signals-vs-react-hooks)
2. [Framework Migration Strategy](#framework-migration-strategy)
3. [Next.js App Router Architecture](#nextjs-app-router-architecture)
4. [Authentication Patterns](#authentication-patterns)
5. [tRPC Version Compatibility](#trpc-version-compatibility)
6. [Component Library Choices](#component-library-choices)
7. [Product Considerations for Real-World Apps](#product-considerations)

---

## SolidJS Signals vs React Hooks

### The Core Difference

**SolidJS Signals:**
```tsx
// SolidJS - Fine-grained reactivity
function Counter() {
  const [count, setCount] = createSignal(0);

  console.log("Component ran once!"); // Runs ONLY on mount

  return (
    <button onClick={() => setCount(count() + 1)}>
      {count()} {/* Only this part updates */}
    </button>
  );
}
```

**React Hooks:**
```tsx
// React - Component re-renders
function Counter() {
  const [count, setCount] = useState(0);

  console.log("Component re-ran!"); // Runs on EVERY state change

  return (
    <button onClick={() => setCount(count + 1)}>
      {count} {/* Entire component re-renders */}
    </button>
  );
}
```

### What Actually Happens

**SolidJS:**
1. Component function runs ONCE on mount
2. Creates reactive signals
3. When signal changes → only dependent DOM nodes update directly
4. No virtual DOM, no diffing, no reconciliation

**React:**
1. Component function runs on mount
2. When state changes → entire component function runs again
3. Creates new virtual DOM
4. React diffs old vs new virtual DOM
5. Updates only changed parts in real DOM

### Performance Implications

**SolidJS Advantages:**
- ✅ Faster updates (no virtual DOM overhead)
- ✅ Smaller bundle size
- ✅ More predictable performance

**React Advantages:**
- ✅ Easier to reason about (just functions)
- ✅ Better dev tools
- ✅ Massive ecosystem

### What Transfers

**Concepts I learned from SolidJS that apply to React:**
- Reactivity fundamentals (dependencies, observers, effects)
- Component composition patterns
- Props drilling and context solutions
- Form state management principles

**What React 19 is adopting:**
- Signals-like primitives (React Compiler, use() hook)
- Fine-grained updates (Auto-memoization)

---

## Framework Migration Strategy

### What to Migrate First

**Our approach:**
1. ✅ **Backend UNCHANGED** - tRPC, Prisma, auth, worker (70% of codebase)
2. ✅ **UI Library Fresh** - shadcn/ui (not migrating SolidJS components)
3. 🔄 **State Management New** - TanStack Query (similar patterns to SolidJS Tanstack Query)
4. 🔄 **Routing New** - Next.js App Router (different from SolidStart)
5. 🔄 **Forms New** - TanStack Form (framework-agnostic, so same API)

### Why This Order Works

**Keep backend stable:**
- Business logic doesn't change
- Database schema unchanged
- API contracts identical
- Type safety preserved across migration

**Rebuild UI fresh:**
- Don't translate component-by-component (too slow, too error-prone)
- Use new framework's best practices from the start
- Take advantage of new libraries (shadcn/ui better than custom SolidJS components)

### Migration vs Rebuild Decision Matrix

| Aspect | Migrate | Rebuild | Our Choice |
|--------|---------|---------|------------|
| **Backend logic** | ✅ Yes | ❌ No | Migrate (70% saved) |
| **UI components** | ❌ No | ✅ Yes | Rebuild (better patterns) |
| **Database schema** | ✅ Yes | ❌ No | Keep (100% reuse) |
| **Auth flow** | ⚠️ Partial | ✅ Mostly | Rebuild UI, keep backend |
| **Routing** | ❌ No | ✅ Yes | Rebuild (different paradigm) |
| **State management** | ⚠️ Partial | ✅ Mostly | Rebuild (similar patterns) |

---

## Next.js App Router Architecture

### Route Groups

**Convention:** Folders in parentheses don't affect URL structure.

```
app/
├── (auth)/              # Group auth pages (no /auth in URL)
│   ├── login/page.tsx   # URL: /login
│   └── register/page.tsx # URL: /register
├── (protected)/         # Group protected pages
│   └── dashboard/page.tsx # URL: /dashboard
└── api/                 # API routes
    └── trpc/[trpc]/route.ts # URL: /api/trpc/*
```

**Why use route groups:**
- Share layouts without affecting URLs
- Organize related pages logically
- Apply middleware to groups

### Server Components vs Client Components

**Default:** Everything is a Server Component (runs on server)

**When to use Client Components:**
- Need useState, useEffect, event handlers
- Need browser APIs (localStorage, window)
- Need third-party libraries that use hooks

**Our usage:**
- `app/page.tsx` → Client ("use client" - uses tRPC mutations)
- `app/api/trpc/[trpc]/route.ts` → Server (API handler)
- Auth pages → Client (forms, state management)
- Dashboard → Client (interactive UI)

---

## Authentication Patterns

### JWT Token Flow (What We're Using)

**1. Register/Login:**
```
User → tRPC auth.login → Backend validates → Returns JWT token
```

**2. Store Token:**
```
Client stores JWT in localStorage (Day 2 implementation)
```

**3. Authenticated Requests:**
```
Client → tRPC client adds Authorization: Bearer <token> header → Backend validates → Returns data
```

**4. Protected Routes:**
```
Client checks localStorage for token → Redirect to /login if missing
```

### Alternative: httpOnly Cookies

**Flow:**
```
User → auth.login → Backend sets httpOnly cookie → Cookie sent automatically on requests
```

**Trade-offs:**

| Aspect | localStorage + JWT | httpOnly Cookie |
|--------|-------------------|-----------------|
| **Security** | ❌ Vulnerable to XSS | ✅ Protected from XSS |
| **Simplicity** | ✅ Easy to implement | ❌ More complex |
| **CSRF** | ✅ Not vulnerable | ❌ Need CSRF tokens |
| **Mobile Apps** | ✅ Easy to use | ❌ Harder to manage |
| **Production** | ⚠️ OK for MVP | ✅ Recommended |

**Our decision:** Start with localStorage (speed), document upgrade path for production.

---

## tRPC Version Compatibility

### The tRPC v11 Issue

**Error encountered:**
```
TypeError: Cannot read properties of undefined (reading 'includes')
at resolveResponse (/node_modules/@trpc/server/dist/...)
```

**Root cause:**
- tRPC v11 expected certain headers from Next.js fetch handler
- Next.js 16 fetch implementation slightly different
- `resHeaders` variable was undefined when tRPC tried to call `.includes()`

**Solution:**
- Downgraded to tRPC v10.45.2
- Aligned TanStack Query to v4 (peer dependency)

### Version Matrix (What Works)

| Next.js | tRPC | TanStack Query | Status |
|---------|------|----------------|--------|
| 16.0.3  | 11.x | 5.x | ❌ Compatibility issues |
| 16.0.3  | 10.45.2 | 4.42.0 | ✅ Stable (our choice) |
| 15.x    | 11.x | 5.x | ✅ Works |
| 14.x    | 10.x | 4.x | ✅ Proven stable |

**Lesson:** When using bleeding-edge versions, stick to proven version combinations.

---

## Component Library Choices

### Why shadcn/ui Over Alternatives

**Evaluated options:**
1. **Material UI** - Too heavy, opinionated design
2. **Chakra UI** - Good, but shadcn has more momentum
3. **Headless UI** - Too low-level, would need to style everything
4. **Ant Design** - Chinese design language, not for our market
5. **shadcn/ui** - ✅ **Chosen**

**Why shadcn/ui:**
- Copy-paste components (you own the code, not a dependency)
- Built on Radix UI (accessibility handled)
- Tailwind-based (consistent with our stack)
- Used by Vercel, Supabase, Cal.com (industry standard emerging)
- Can customize without fighting abstractions

**Learning benefit:**
- Actually see how components work (not a black box)
- Learn Radix UI patterns (composable primitives)
- Understand accessibility implementation
- Can fork/modify any component

---

## Product Considerations for Real-World Apps

### Legal Requirements (If This Becomes a Business)

**Before public launch:**

1. **Privacy Policy** (REQUIRED)
   - Collecting phone numbers = personal data
   - Must explain: what data, why, how stored, how deleted
   - GDPR (EU), CCPA (California) compliance

2. **Terms of Service** (REQUIRED)
   - User agreements
   - Liability limitations
   - Twilio compliance requirements

3. **Cookie Consent** (IF using cookies)
   - EU Cookie Law
   - Banner + opt-in for non-essential cookies

4. **Data Processing Agreement** (IF scaling)
   - GDPR requirement for EU users
   - Twilio has their own DPA

**Resources:**
- termsfeed.com (generate templates)
- iubenda.com (compliance tool)
- Lawyer review before launch (cost: $500-2000)

### Security Checklist

**Before production:**

- [ ] Rate limiting on auth endpoints (prevent brute force)
- [ ] Phone number verification (prevent spam/abuse)
- [ ] Input sanitization (prevent XSS)
- [ ] SQL injection protection (Prisma handles this ✅)
- [ ] HTTPS enforced (Vercel handles this ✅)
- [ ] Environment variables secured (never in code ✅)
- [ ] Token expiration (JWT exp claim)
- [ ] Token refresh mechanism
- [ ] CORS configured properly
- [ ] CSP headers (Content Security Policy)

**Resources:**
- OWASP Top 10
- Next.js security best practices
- Vercel security documentation

### Scalability Considerations

**Current architecture limits:**

| Component | Current | Limit | Solution at Scale |
|-----------|---------|-------|-------------------|
| **Cron job** | node-cron | ~1000 users | BullMQ, Trigger.dev, Inngest |
| **Database** | SQLite (dev) | Development only | PostgreSQL (Vercel/Neon) |
| **WhatsApp sending** | Twilio sandbox | 10-20 msg/day | Twilio production API |
| **API routes** | Next.js serverless | Good to 10k+ users | Edge functions if needed |

**When to scale (rough estimates):**
- <100 users: Current architecture fine
- 100-1000 users: Move cron → queue system
- 1000-10k users: Optimize database queries, add caching
- 10k+ users: Consider microservices, CDN, edge compute

---

## What's Next

**Day 2 learnings to document:**
- Auth context patterns in React
- Protected routes implementation
- Form validation with Zod + TanStack Form
- shadcn/ui Form components deep dive

**Future topics:**
- TanStack Query caching strategies
- Optimistic UI updates
- Error boundaries
- Loading states patterns
- Accessibility (ARIA, keyboard navigation)
- Performance optimization (React.memo, useMemo, useCallback)

---

**Last Updated:** November 15, 2025
**Status:** Day 1 learnings documented
**Next Update:** After Day 2 implementation
