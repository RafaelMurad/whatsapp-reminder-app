# Next.js 15 + React 19 Architecture

**Prerequisites:** Design System Fundamentals  
**Time to Read:** 30-40 minutes  
**Difficulty:** Intermediate

---

## 🎯 What You'll Learn

- App Router vs Pages Router architecture
- React Server Components (RSC) vs Client Components
- File-based routing and layouts
- Data fetching patterns
- Server Actions
- Streaming and Suspense

---

## 📖 What is Next.js?

### Simple Definition
**Next.js** is a React framework that handles all the complex infrastructure (routing, bundling, server-side rendering) so you can focus on building features.

Think of it like this:
- **React** = JavaScript library for building UIs
- **Next.js** = Complete framework built on React with routing, data fetching, deployment tools

**Analogy:** React is like a car engine. Next.js is the complete car with steering wheel, transmission, and GPS built-in.

### Why Do We Use Next.js?

**Problems it solves:**
1. **No Router in React** - React doesn't include routing out of the box
2. **SEO Challenges** - Client-side React apps struggle with search engines
3. **Slow Initial Load** - All React code loads before showing content
4. **Complex Setup** - Webpack, Babel, TypeScript config is tedious
5. **No Standard Structure** - Every React app has different folder structures

**Real-world example from our project:**

Without Next.js:
```tsx
// Need to install react-router-dom
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Need to configure webpack, babel
// Need to set up dev server
// Need to handle code splitting manually
```

With Next.js:
```tsx
// Just create files in app/ folder
app/
  page.tsx           → /
  login/page.tsx     → /login
  dashboard/page.tsx → /dashboard
// Routing, bundling, dev server all included
```

---

## 🗺️ App Router vs Pages Router

Next.js has two routing systems. We use the **App Router** (modern, recommended).

### Pages Router (Legacy - Before Next.js 13)

```
pages/
  index.js          → /
  about.js          → /about
  blog/
    [slug].js       → /blog/:slug
```

**Limitations:**
- All components are Client Components by default
- No streaming
- No layouts with shared state
- getServerSideProps and getStaticProps are verbose

### App Router (Modern - Next.js 13+)

```
app/
  page.tsx          → /
  about/page.tsx    → /about
  blog/
    [slug]/page.tsx → /blog/:slug
```

**Benefits:**
- Server Components by default (faster, smaller bundles)
- Layouts with shared state
- Streaming and Suspense support
- Simpler data fetching

**Our project structure:**
```
apps/web/app/
  layout.tsx              # Root layout (fonts, providers)
  page.tsx                # Homepage (/)
  globals.css             # Global styles
  
  (auth)/                 # Route group (doesn't affect URL)
    login/page.tsx        # /login
    register/page.tsx     # /register
  
  (protected)/            # Route group with auth check
    layout.tsx            # Protected layout (auth guard)
    dashboard/page.tsx    # /dashboard
  
  api/
    trpc/[trpc]/route.ts  # tRPC API endpoint
```

---

## ⚛️ React Server Components (RSC)

### The Big Shift

**React 19's biggest change:** Components can now run on the server by default.

#### Traditional React (Client Components)
```tsx
'use client';  // Runs in browser

export default function Counter() {
  const [count, setCount] = useState(0);  // State requires client
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### Server Components (Default in App Router)
```tsx
// No 'use client' directive = Server Component

export default async function Dashboard() {
  // Can fetch data directly, no useState/useEffect
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  
  return <div>{json.title}</div>;
}
```

### Server Components Rules

**Can do:**
- ✅ Fetch data directly (async/await)
- ✅ Access backend resources (databases, files)
- ✅ Keep sensitive data on server (API keys, secrets)
- ✅ Reduce bundle size (code stays on server)

**Cannot do:**
- ❌ Use hooks (useState, useEffect, useContext)
- ❌ Use event listeners (onClick, onChange)
- ❌ Use browser APIs (localStorage, window)
- ❌ Use Context providers

### When to Use Each

| Server Components | Client Components |
|-------------------|-------------------|
| Fetching data | Interactivity (clicks, form inputs) |
| Accessing backend | Using hooks (useState, useEffect) |
| Keeping secrets | Browser APIs (localStorage) |
| Static content | Event handlers |

### Example from Our Project

**Server Component** (`app/page.tsx` - Home page):
```tsx
// No 'use client' - runs on server
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <h1 className="text-4xl font-bold text-center">
          WhatsApp Reminder App
        </h1>
        {/* Static content, no interactivity */}
      </div>
    </div>
  );
}
```

**Client Component** (`app/(protected)/layout.tsx` - Auth guard):
```tsx
"use client";  // MUST be client - uses hooks

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();  // useAuth hook

  useEffect(() => {  // useEffect hook
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
```

**Why?** The protected layout needs:
- `useAuth()` hook for auth context
- `useEffect()` to redirect unauthenticated users
- `useRouter()` for navigation

All of these require client-side JavaScript.

---

## 🗂️ File-Based Routing

### Special Files

Next.js uses file conventions to define UI structure:

| File | Purpose | Example |
|------|---------|---------|
| `layout.tsx` | Shared UI wrapper | Navbar, footer |
| `page.tsx` | Unique page content | Dashboard, login |
| `loading.tsx` | Loading UI (Suspense fallback) | Spinners |
| `error.tsx` | Error UI boundary | Error messages |
| `route.ts` | API endpoint | tRPC handler |

### Layouts Deep Dive

Layouts **wrap** their children and **persist** across navigations.

**Example from our project:**

```tsx
// apps/web/app/layout.tsx - ROOT LAYOUT
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="antialiased">
        <Providers>  {/* Auth, tRPC, Theme providers */}
          {children}
          <Toaster />  {/* Toast notifications */}
        </Providers>
      </body>
    </html>
  );
}
```

**What this does:**
- Wraps ALL pages
- Fonts load once and persist
- Providers available everywhere
- Toaster shows on every page

```tsx
// apps/web/app/(protected)/layout.tsx - PROTECTED LAYOUT
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }
  
  return <>{children}</>;
}
```

**What this does:**
- Only wraps pages inside `(protected)/` folder
- Checks auth before rendering
- Redirects to login if not authenticated

**Layout nesting:**
```
Root Layout (fonts, providers)
  └─ (protected) Layout (auth guard)
       └─ dashboard/page.tsx (actual content)
```

---

## 🎣 Data Fetching Patterns

### Pattern 1: Server Component Fetch (Simplest)

```tsx
// Server Component - fetches on every request
export default async function Dashboard() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  
  return <div>{data.title}</div>;
}
```

**Use when:** Data changes frequently, SEO needed

### Pattern 2: tRPC + Client Component (Our Approach)

```tsx
'use client';

import { trpc } from '@/lib/trpc';

export default function Dashboard() {
  const { data, isLoading } = trpc.reminder.list.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.reminders.length} reminders</div>;
}
```

**Use when:** Need client interactivity, type-safe API

### Pattern 3: Server Actions (Forms)

```tsx
// Server Action (runs on server)
async function createReminder(formData: FormData) {
  'use server';
  
  const title = formData.get('title');
  await db.reminder.create({ data: { title } });
}

// Client Component
export default function ReminderForm() {
  return (
    <form action={createReminder}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Use when:** Form submissions without client JavaScript

---

## 🌊 Streaming and Suspense

### The Problem
Traditional apps wait for ALL data before showing anything:

```
User clicks → Wait 2s for data → Show entire page
```

### The Solution: Streaming
Show parts of the page as they're ready:

```
User clicks → Show layout instantly → Stream data as it loads
```

### Example with Suspense

```tsx
import { Suspense } from 'react';

async function SlowComponent() {
  const data = await fetchSlowData();  // Takes 2 seconds
  return <div>{data.title}</div>;
}

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>  {/* Shows instantly */}
      
      <Suspense fallback={<div>Loading...</div>}>
        <SlowComponent />  {/* Streams in when ready */}
      </Suspense>
    </div>
  );
}
```

**User experience:**
1. See "Dashboard" heading immediately
2. See "Loading..." fallback
3. See actual data when ready (2s later)

Much better than staring at a blank screen for 2 seconds!

---

## 🌍 Our Tech vs Alternatives

### What We Use: Next.js 15.0.3

**Philosophy:** React framework with full-stack capabilities  
**Official Docs:** https://nextjs.org/docs

**Pros:**
- ✅ Best-in-class developer experience
- ✅ Excellent performance (Server Components)
- ✅ File-based routing (intuitive)
- ✅ Vercel deployment is seamless
- ✅ Huge ecosystem and community

**Cons:**
- ❌ Opinionated (less flexibility)
- ❌ Vercel lock-in (for best experience)
- ❌ Learning curve for RSC

### Alternative 1: Remix

**Philosophy:** Web fundamentals + progressive enhancement  
**Official Docs:** https://remix.run/docs

**Pros:**
- ✅ Focuses on web standards (Forms, URLs)
- ✅ Excellent error handling
- ✅ Nested routing with data loading
- ✅ Works great without JavaScript

**Cons:**
- ❌ Smaller ecosystem than Next.js
- ❌ No built-in image optimization
- ❌ Requires more manual setup

**When to use:** Apps prioritizing web standards and progressive enhancement

**Key Difference:**
```tsx
// Next.js - React-first
const { data } = trpc.reminder.list.useQuery();

// Remix - Forms-first
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Handle form submission
}
```

### Alternative 2: SvelteKit

**Philosophy:** Compile-time framework (no virtual DOM)  
**Official Docs:** https://kit.svelte.dev/docs

**Pros:**
- ✅ Smallest bundle sizes
- ✅ Fastest runtime performance
- ✅ Less boilerplate code
- ✅ Built-in animations

**Cons:**
- ❌ Smaller ecosystem than React
- ❌ Less job market demand
- ❌ Fewer third-party libraries

**When to use:** Performance-critical apps, personal projects

**Key Difference:**
```tsx
// Next.js/React - Runtime
const [count, setCount] = useState(0);

// Svelte - Compile-time
let count = 0;  // Compiled to reactive code
```

### Alternative 3: Nuxt (Vue)

**Philosophy:** Vue.js framework (similar to Next.js)  
**Official Docs:** https://nuxt.com/docs

**Pros:**
- ✅ Similar features to Next.js
- ✅ Vue's simpler template syntax
- ✅ Excellent TypeScript support
- ✅ Great for Vue developers

**Cons:**
- ❌ Smaller ecosystem than React
- ❌ Less adoption in job market

**When to use:** You prefer Vue over React

### Alternative 4: Astro

**Philosophy:** Content-focused, zero JS by default  
**Official Docs:** https://docs.astro.build

**Pros:**
- ✅ Perfect for content sites (blogs, docs)
- ✅ Mix any framework (React, Vue, Svelte)
- ✅ Smallest possible bundle
- ✅ Islands architecture

**Cons:**
- ❌ Not ideal for highly interactive apps
- ❌ Less mature than Next.js

**When to use:** Marketing sites, blogs, documentation

---

## 📊 Comparison Table

| Framework | Performance | DX | Ecosystem | Learning Curve | Use Case |
|-----------|-------------|-----|-----------|----------------|----------|
| **Next.js** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Full-stack apps |
| Remix | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Web-first apps |
| SvelteKit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Performance apps |
| Nuxt | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Vue apps |
| Astro | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Content sites |

---

## 🤔 Reflection Questions

1. **What's the main benefit of Server Components?**
   <details>
   <summary>Answer</summary>
   Smaller bundle sizes (code stays on server), direct data access without API endpoints, better performance for non-interactive content.
   </details>

2. **When MUST you use 'use client'?**
   <details>
   <summary>Answer</summary>
   When using hooks (useState, useEffect, useContext), event handlers (onClick), or browser APIs (localStorage, window).
   </details>

3. **What's the difference between layout.tsx and page.tsx?**
   <details>
   <summary>Answer</summary>
   Layouts wrap children and persist across navigations. Pages are unique to each route and re-render on navigation.
   </details>

4. **Why use Next.js instead of plain React?**
   <details>
   <summary>Answer</summary>
   Built-in routing, file-based structure, SSR/SSG, image optimization, no complex webpack config, better SEO, better performance.
   </details>

5. **When would you choose Remix over Next.js?**
   <details>
   <summary>Answer</summary>
   When prioritizing web standards (forms, URLs), progressive enhancement, or want less Vercel lock-in.
   </details>

---

## 🔗 Official Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **App Router Guide:** https://nextjs.org/docs/app
- **Server Components:** https://react.dev/reference/rsc/server-components
- **Remix Docs:** https://remix.run/docs
- **SvelteKit Docs:** https://kit.svelte.dev/docs

---

## ✅ Key Takeaways

- Next.js solves routing, SSR, and infrastructure problems React doesn't handle
- App Router uses Server Components by default for better performance
- Use 'use client' only when you need interactivity or hooks
- File-based routing makes structure intuitive
- Layouts enable shared UI that persists across navigations
- Streaming + Suspense improves perceived performance

---

**Next:** [03. shadcn/ui Component System →](./03-shadcn-ui-system.md)
