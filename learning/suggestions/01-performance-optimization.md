# Performance Optimization

**Prerequisites:** Next.js Architecture, React Query  
**Time to Read:** 40-50 minutes  
**Difficulty:** Advanced

---

## 🎯 What You'll Learn

- React Server Components (RSC) performance benefits
- Code splitting and lazy loading
- Image optimization with next/image
- Bundle analysis and tree shaking
- React Query caching strategies
- Lighthouse audits and Core Web Vitals
- Performance monitoring

---

## 📖 Why Performance Matters

### The Impact

**Analogy:**
- **Fast site** = Empty highway (smooth, instant responses)
- **Slow site** = Traffic jam (frustrating, users leave)

**Real numbers:**
- 1 second delay → 7% conversion loss
- 3 second load → 53% mobile users bounce
- Amazon: 100ms delay = 1% revenue loss

---

## ⚡ React Server Components Performance

### The Problem with Client Components

**Traditional React (everything on client):**

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  
  useEffect(() => {
    fetch('/api/reminders')
      .then(res => res.json())
      .then(data => setReminders(data));
  }, []);
  
  return <div>{reminders.map(r => <Card key={r.id} {...r} />)}</div>;
}
```

**Problems:**
1. ❌ Fetch happens on client (slow network roundtrip)
2. ❌ Loading state (users see spinner)
3. ❌ Entire React included in bundle (larger JS)

### Server Components Solution

**Our approach:**

```tsx
// app/(protected)/dashboard/page.tsx
import { prisma } from '@repo/db';

export default async function Dashboard() {
  // Fetch on server (fast database connection)
  const reminders = await prisma.reminder.findMany();
  
  // HTML sent to client (instant render!)
  return <div>{reminders.map(r => <Card key={r.id} {...r} />)}</div>;
}
```

**Benefits:**
1. ✅ Zero client-side fetch (instant data)
2. ✅ No loading state (HTML includes data)
3. ✅ Smaller JS bundle (React not needed for this component)
4. ✅ SEO-friendly (content in HTML)

### When to Use Each

| Use Server Component When | Use Client Component When |
|---------------------------|---------------------------|
| Fetching data | Need useState, useEffect |
| Accessing database | Need event handlers (onClick) |
| Sensitive data (API keys) | Need browser APIs (localStorage) |
| Large dependencies (syntax highlighter) | Need real-time updates |
| SEO important | Need animations |

---

## 📦 Code Splitting

### Automatic Code Splitting

**Next.js does this automatically:**

```
apps/web/app/
  (auth)/
    login/page.tsx      → login-xxx.js (50KB)
  (protected)/
    dashboard/page.tsx  → dashboard-xxx.js (80KB)
    settings/page.tsx   → settings-xxx.js (30KB)
```

**Result:**
- Visit `/login` → Only load `login-xxx.js`
- Visit `/dashboard` → Only load `dashboard-xxx.js`
- Users never download unused code

### Manual Code Splitting (Dynamic Imports)

**For heavy components:**

```tsx
import dynamic from 'next/dynamic';

// Load chart library only when needed
const Chart = dynamic(() => import('./chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,  // Don't render on server (client-only)
});

export default function Analytics() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && <Chart data={data} />}
    </div>
  );
}
```

**Before:**
- Bundle: 500KB (includes chart library)
- Initial load: Slow

**After:**
- Initial bundle: 100KB (no chart)
- Chart bundle: 400KB (loaded on demand)
- Initial load: Fast!

---

## 🖼️ Image Optimization

### The Problem

**Regular `<img>` tag:**

```tsx
<img src="/hero.jpg" alt="Hero" />
```

**Problems:**
1. ❌ Serves original size (5MB image for 300px display)
2. ❌ No lazy loading (loads offscreen images)
3. ❌ No modern formats (WebP, AVIF)
4. ❌ Layout shift (image loads → page jumps)

### Next.js Image Component

**Our approach:**

```tsx
import Image from 'next/image';

export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={800}
      height={600}
      priority  // Load immediately (above fold)
      placeholder="blur"  // Show blur while loading
      blurDataURL="data:image/..."
    />
  );
}
```

**What Next.js does automatically:**
1. ✅ Resizes to display size (300px image for 300px display)
2. ✅ Lazy loads offscreen images
3. ✅ Serves WebP/AVIF (40% smaller than JPEG)
4. ✅ Reserves space (no layout shift)
5. ✅ Responsive (different sizes for mobile/desktop)

**Performance impact:**
- Before: 5MB image
- After: 50KB WebP (100x smaller!)

---

## 📊 Bundle Analysis

### Analyzing Bundle Size

```bash
# Install analyzer
pnpm add -D @next/bundle-analyzer

# Configure
# next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true pnpm build
```

**Output:**
- Opens interactive treemap
- Shows largest packages
- Identifies duplicates

**Example findings:**
```
Total: 500KB
├─ react + react-dom: 150KB (necessary)
├─ @trpc/client: 50KB (necessary)
├─ lodash: 200KB ❌ (only use 2 functions!)
└─ moment.js: 100KB ❌ (native Intl API exists)
```

### Tree Shaking

**Problem:**

```typescript
import _ from 'lodash';  // Imports entire library (200KB)
const doubled = _.map([1, 2, 3], n => n * 2);
```

**Solution 1: Named imports**

```typescript
import { map } from 'lodash-es';  // Only imports map (5KB)
const doubled = map([1, 2, 3], n => n * 2);
```

**Solution 2: Native APIs**

```typescript
const doubled = [1, 2, 3].map(n => n * 2);  // Zero bytes!
```

---

## 💾 React Query Caching

### Default Caching Behavior

**Our reminders query:**

```tsx
const { data } = trpc.reminder.getAll.useQuery();
```

**What happens:**
1. First render: Fetch from server
2. Navigate away
3. Navigate back: **Instant!** (served from cache)
4. After 5 minutes: Refetch in background

### Cache Configuration

```tsx
const { data } = trpc.reminder.getAll.useQuery(undefined, {
  staleTime: 1000 * 60 * 5,    // 5 minutes (consider fresh)
  cacheTime: 1000 * 60 * 30,   // 30 minutes (keep in cache)
  refetchOnWindowFocus: true,  // Refetch when tab focused
  refetchOnReconnect: true,    // Refetch when online again
});
```

**Strategies:**

| Data Type | staleTime | cacheTime | Example |
|-----------|-----------|-----------|---------|
| Real-time | 0 | 5 min | Live stock prices |
| Frequently changing | 30 sec | 5 min | Social feed |
| **Reminders** | 5 min | 30 min | Todo lists |
| Static | Infinity | Infinity | Blog posts |

### Prefetching

**Load data before user navigates:**

```tsx
import { useQueryClient } from '@tanstack/react-query';

export default function ReminderList() {
  const queryClient = useQueryClient();
  
  return (
    <Link
      href="/reminder/123"
      onMouseEnter={() => {
        // Prefetch on hover
        queryClient.prefetchQuery(['reminder', '123'], () =>
          fetchReminder('123')
        );
      }}
    >
      View Reminder
    </Link>
  );
}
```

**Result:** Instant navigation (data already loaded)

---

## 🎯 Core Web Vitals

### What They Measure

**1. Largest Contentful Paint (LCP)**
- **What:** Time to render largest element
- **Goal:** < 2.5 seconds
- **Fix:** Optimize images, use CDN, server-side render

**2. First Input Delay (FID)**
- **What:** Time from user interaction to browser response
- **Goal:** < 100ms
- **Fix:** Reduce JavaScript, code split, use web workers

**3. Cumulative Layout Shift (CLS)**
- **What:** How much page jumps during load
- **Goal:** < 0.1
- **Fix:** Reserve space for images, avoid dynamic content injection

### Measuring in Our App

```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />  {/* Auto-measures Core Web Vitals */}
      </body>
    </html>
  );
}
```

**View results:** Vercel dashboard → Analytics → Web Vitals

---

## 🌍 Our Tech vs Alternatives

### What We Use: Next.js App Router

**Philosophy:** Server-first with client interactivity  
**Official Docs:** https://nextjs.org/docs/app

**Pros:**
- ✅ Server Components (zero client JS)
- ✅ Automatic code splitting
- ✅ Image optimization built-in
- ✅ Streaming (show content as it loads)
- ✅ Edge runtime (deploy globally)

**Cons:**
- ❌ Learning curve (new paradigm)
- ❌ Can't use all React libraries (client-only)

**Best for:** Content-heavy apps, SEO important, global audience

### Alternative 1: Vite + React

**Philosophy:** Fast dev server, minimal tooling  
**Official Docs:** https://vitejs.dev

**Pros:**
- ✅ Fastest dev server (hot module replacement)
- ✅ Simple mental model (just React)
- ✅ Works with all React libraries
- ✅ Smaller learning curve

**Cons:**
- ❌ Client-only (no SSR by default)
- ❌ Manual code splitting
- ❌ No image optimization
- ❌ Worse initial load performance

**When to use:** SPAs (not public-facing), dashboards, internal tools

### Alternative 2: Astro

**Philosophy:** Ship zero JavaScript by default  
**Official Docs:** https://astro.build

**Pros:**
- ✅ Insanely fast (static HTML)
- ✅ Partial hydration (add JS only where needed)
- ✅ Multi-framework (React + Vue + Svelte)
- ✅ Content-focused

**Cons:**
- ❌ Not ideal for interactive apps
- ❌ Limited dynamic data fetching
- ❌ Smaller ecosystem

**When to use:** Blogs, marketing sites, documentation

### Alternative 3: Solid.js

**Philosophy:** Fine-grained reactivity (no Virtual DOM)  
**Official Docs:** https://www.solidjs.com

**Pros:**
- ✅ Fastest runtime performance (no VDOM)
- ✅ Similar syntax to React
- ✅ Smaller bundle (no runtime overhead)
- ✅ Native TypeScript

**Cons:**
- ❌ Smaller ecosystem
- ❌ Less tooling support
- ❌ Different mental model (reactivity vs re-renders)

**When to use:** Performance-critical apps, dashboards, data visualizations

---

## 🤔 Reflection Questions

1. **What's the main benefit of Server Components?**
   <details>
   <summary>Answer</summary>
   Fetch data on server (fast), send HTML to client (instant render), reduce JavaScript bundle (smaller download). Zero client-side fetch overhead.
   </details>

2. **When should you use dynamic imports?**
   <details>
   <summary>Answer</summary>
   Heavy libraries (charts, editors), below-fold content, modal dialogs, admin features. Anything user might not interact with.
   </details>

3. **Why is next/image better than <img>?**
   <details>
   <summary>Answer</summary>
   Automatic resizing, lazy loading, modern formats (WebP), layout shift prevention, responsive srcset. Massively reduces bandwidth.
   </details>

4. **What's tree shaking?**
   <details>
   <summary>Answer</summary>
   Removing unused code from bundles. Import only what you use (named imports), dead code elimination, smaller bundles.
   </details>

5. **How does React Query improve performance?**
   <details>
   <summary>Answer</summary>
   Caching (avoid redundant fetches), background refetching (fresh data), prefetching (instant navigation), deduplication (single request for multiple components).
   </details>

---

## 🔗 Official Resources

- **Next.js Performance:** https://nextjs.org/docs/app/building-your-application/optimizing
- **Core Web Vitals:** https://web.dev/vitals/
- **React Query Performance:** https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- **Bundle Analyzer:** https://www.npmjs.com/package/@next/bundle-analyzer
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Web.dev Performance:** https://web.dev/fast/

---

## ✅ Key Takeaways

- **Server Components** eliminate client-side fetching overhead
- **Code splitting** loads only necessary JavaScript
- **next/image** reduces image bandwidth by 90%+
- **Bundle analysis** identifies optimization opportunities
- **React Query caching** avoids redundant network requests
- **Core Web Vitals** measure real user experience
- **Tradeoff:** Complexity vs performance gains

---

**Back to:** [Advanced Topics Index →](./README.md)
