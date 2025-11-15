# Tech Stack Decisions

Why I chose what I chose, and why I'm migrating to React.

**Last Updated:** November 14, 2025

---

## The Big Decision: SolidJS → React/Next.js

### What happened

I built this entire WhatsApp reminder app in SolidJS. Full auth system, tRPC backend, Prisma database, background worker, the whole thing. It works perfectly locally. Then I tried to deploy it and hit wall after wall with SolidStart + serverless platforms.

While debugging deployment issues, I did some research on SolidJS adoption. Turns out there are literally less than 50 job postings globally for SolidJS, compared to 10,000+ for React. That was a wake-up call.

### Why migrate now?

**What I learned from SolidJS** (worth keeping):
- Fine-grained reactivity and signals (transferable to Vue, Svelte)
- The signals pattern is actually coming to React 19 anyway
- Component architecture fundamentals
- How reactive systems work under the hood

**What doesn't transfer**:
- SolidJS-specific APIs
- SolidStart meta-framework knowledge
- The deployment headaches

**The math**:
- I can reuse 70% of my work (entire backend: tRPC, Prisma, auth, worker)
- Migration: ~5-7 days vs building new React project: 6+ weeks
- Next.js + Vercel deployment is proven vs fighting SolidStart edge cases

I'm not abandoning what I built. I'm translating the UI to a framework that's actually used in production. The hard parts (backend logic, API design, database schema) stay exactly the same.

### Quick comparison

| What | SolidJS | React/Next.js |
|------|---------|---------------|
| Learning value | High (reactivity concepts) | High (industry standard) |
| Ecosystem | Small but growing | Massive |
| Deployment | Complex | Straightforward (Vercel) |
| Transferability | Moderate | Very high |
| Practical use | Niche | Universal |

**Decision**: Migrate to React/Next.js. Keep the SolidJS learnings, get the React ecosystem benefits.

---

## UI Library: shadcn/ui

I'm going with shadcn/ui instead of Material UI or building custom components.

**Why shadcn is interesting**:
- You copy the components into your codebase, so you own the code
- Built on Radix UI (accessibility handled)
- Customizable with Tailwind
- Used by Vercel, Supabase, Cal.com - seems to be the new standard

**Learning benefits**:
- I can actually see how the components work (not a black box)
- Learn Radix UI patterns
- Understand composition patterns in React
- If I need to customize something, I just... edit the code

**Alternatives I considered**:
- **Material UI**: Too heavy, harder to customize
- **Chakra UI**: Good, but shadcn has more momentum right now
- **Build custom**: 3x the time, and I'll probably reinvent the wheel poorly
- **Radix UI directly**: Slower, but shadcn uses it under the hood anyway

shadcn hits the sweet spot of fast implementation + learning + modern stack.

---

## Forms: TanStack Form

Using TanStack Form instead of React Hook Form.

**Why**:
- Framework-agnostic (works with React, Vue, Solid, Svelte)
- I already know I'll be jumping between frameworks - this investment transfers
- TypeScript-first with Zod integration (I'm already using Zod)
- Part of the TanStack ecosystem (Query, Router, Table, Form)

**Alternatives**:
- **React Hook Form**: More popular, but React-only. Doesn't transfer.
- **Formik**: Declining, also React-only
- **Manual**: Would be a good learning exercise, but not practical for MVP

Learning framework-agnostic tools means I'm not locked into React. I can take this knowledge to Vue or Svelte projects later.

---

## Deployment

**Frontend + API**: Vercel
- Built for Next.js, zero-config deployment
- Tried SolidStart on Vercel - nightmare. Next.js will be smooth.

**Database**: Vercel Postgres
- Integrated platform, serverless PostgreSQL
- Free tier works for portfolio
- Prisma works great with it

**Worker**: Railway
- Need always-on process for cron jobs
- Simple GitHub deployment
- Free tier is generous

---

## What I'm building toward

This isn't just a migration - it's setting up my ongoing learning lab.

**Immediate** (this week):
- Get comfortable with Next.js 15 App Router
- Learn React patterns and hooks
- Deploy something that actually works in production

**Next** (weeks 2-4):
- Add animations (Framer Motion)
- Charts for reminder analytics (Recharts)
- Testing (Vitest + Playwright)
- AI features (OpenAI API)

**Later**:
- Location-based reminders (Mapbox)
- Real-time updates (WebSockets)
- Whatever sounds interesting

The idea is to have a real app I can continuously improve while learning new tech. Each feature is an excuse to try something new.

---

## My decision framework

Before I add any new tech, I check:

1. **Does it teach transferable concepts?** (Not just API memorization)
2. **Is the ecosystem alive?** (Recent updates, community support)
3. **Does it solve a real problem?** (Not just tech for tech's sake)
4. **Can I learn it reasonably fast?** (Time investment worth it?)
5. **Is it used in production?** (Not just hype)

If it scores well on most of these, I'll try it. If not, I skip it or come back later.

**Red flags**:
- Libraries with <1k stars and no activity
- Framework-specific when framework-agnostic exists
- Over-engineering simple problems
- Hype without substance

---

## Decision log

| Date | What | Why | Notes |
|------|------|-----|-------|
| Nov 14 | Migrate to React/Next.js | Reuse backend, proven deployment, industry standard | 5-7 day timeline |
| Nov 14 | shadcn/ui | Own the code, learn Radix patterns | Vercel uses it |
| Nov 14 | TanStack Form | Framework-agnostic, transfers to other projects | Works with Zod |
| Nov 14 | Vercel deployment | Zero-config Next.js, integrated platform | vs Netlify/Railway |
| Nov 14 | Railway worker | Always-on cron, simple setup | Free tier works |

---

**This doc evolves as I learn. Decisions aren't permanent - just current best thinking.**
