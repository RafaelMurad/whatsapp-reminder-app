# Migration Journal: SolidJS → React/Next.js

**Purpose:** Day-by-day log of migration decisions, learnings, and considerations.

**Format:** Chronological entries documenting WHY decisions were made, not just WHAT was done.

---

## Entry 1: November 15, 2025 - Day 1 Complete

### What Was Accomplished

**Infrastructure Setup:**
- ✅ SolidJS app archived to `archive/solidjs-version/` (fully functional, preserved for comparison)
- ✅ Next.js 16.0.3 scaffolded with App Router, TypeScript, Tailwind CSS v4
- ✅ Git branch `feat/nextjs-migration` created (keeping main stable)
- ✅ Prettier configured with Tailwind plugin

**Component Library:**
- ✅ shadcn/ui installed and configured
- ✅ Components added: button, card, dialog, form, input, label, sonner (toast)
- ✅ Using Radix UI primitives under the hood

**Data & API Layer:**
- ✅ TanStack Query v4.42.0 installed (not v5 - see version decision below)
- ✅ TanStack Form installed (framework-agnostic choice)
- ✅ tRPC v10.45.2 client connected (not v11 - see version decision below)
- ✅ tRPC route handler created at `app/api/trpc/[trpc]/route.ts`
- ✅ Test endpoint working (auth.login successfully tested)

**Environment:**
- ✅ `.env.local` created with DATABASE_URL and JWT_SECRET
- ✅ Dev server running successfully

---

### Key Technical Decisions

#### Decision 1: tRPC v10 vs v11

**Problem:** Initial attempt with tRPC v11 resulted in runtime error:
```
TypeError: Cannot read properties of undefined (reading 'includes')
```

**Root Cause:** tRPC v11 has compatibility issues with Next.js 16's fetch handler.

**Solution:** Downgraded to tRPC v10.45.2

**Rationale:**
- tRPC v10 is proven stable with Next.js App Router
- v11 is newer but has edge cases with Next.js 16
- v10 has better peer dependency alignment

**Trade-offs:**
- ✅ Stability and reliability (critical for learning)
- ❌ Missing some v11 features (acceptable for MVP)
- ✅ Better documentation and community solutions

**Future Path:** Can upgrade to v11 when compatibility improves.

---

#### Decision 2: TanStack Query v4 vs v5

**Problem:** TanStack Query v5 has peer dependency conflicts with tRPC v10.

**Solution:** Used TanStack Query v4.42.0

**Rationale:**
- tRPC v10 officially supports TanStack Query v4
- v5 is designed for tRPC v11
- Avoiding mismatched peer dependencies prevents subtle bugs

**Trade-offs:**
- ✅ Stable, well-tested integration
- ❌ Missing v5 features (simplified API, better TypeScript inference)
- ✅ Easier migration path (both to v5 when tRPC v11 is stable)

---

### Product Considerations Discovered

#### Legal & Compliance
- **GDPR/CCPA:** Collecting phone numbers = personal data = privacy policy required
- **Twilio ToS:** WhatsApp Business API has usage restrictions
- **Cookie Consent:** Required if we use cookies (EU law)

**Action:** Document these in `docs/product/` folder (create in future sprint)

#### Security
- **Rate Limiting:** Login endpoint needs protection from brute force attacks
- **Phone Verification:** Should verify phone numbers before allowing WhatsApp sends
- **Input Sanitization:** All user inputs need XSS prevention

**Action:** Create security checklist for pre-production audit

#### Scalability
- **Cron Job → Queue:** Current node-cron approach won't scale beyond ~1000 users
- **Database Indexing:** Already optimized in schema (scheduledFor, userId indexes)
- **API Rate Limits:** Twilio has limits, need to plan for them

**Action:** Add to roadmap for "Week 2+" features

---

### What I Learned Today

**Technical:**
- Next.js 16 App Router structure (route groups with `(auth)` and `(protected)`)
- tRPC version compatibility nuances
- shadcn/ui component installation and customization
- Peer dependency resolution strategies

**Process:**
- Importance of version compatibility when using cutting-edge tools
- Value of reading error stack traces carefully (found tRPC issue quickly)
- Test-driven migration (verify each piece works before moving on)

---

### Tomorrow's Focus (Day 2)

**Priority 1:** Auth state management
- Create auth context (`lib/auth-context.tsx`)
- Token storage (start with localStorage, document upgrade path)
- Add Authorization header to tRPC client

**Priority 2:** Login & Register pages
- Build `app/(auth)/login/page.tsx`
- Build `app/(auth)/register/page.tsx`
- Form validation with Zod

**Priority 3:** Dashboard shell
- Build `app/(protected)/dashboard/page.tsx`
- Protected route middleware
- Logout functionality

---

**Last Updated:** November 15, 2025
**Current Phase:** Day 1 Complete, Day 2 Starting