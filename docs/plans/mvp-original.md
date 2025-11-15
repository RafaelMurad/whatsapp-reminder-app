# WhatsApp Reminder App - MVP Plan

**Goal:** Complete working MVP in 7 days  
**Timeline:** November 11-18, 2025  
**Purpose:** Portfolio project demonstrating full-stack TypeScript expertise

---

## Current Progress (Updated: Nov 13, 2025)

### Day 1: Foundation
Status: ✅ Completed core setup; proceeded to backend implementation.

**Completed Milestones (Day 1):**
- Monorepo initialized (pnpm workspaces, folder structure)
- Dependencies installed (SolidStart, tRPC, Prisma, Tailwind, Zod, Auth libs)
- TypeScript configured (root + package-specific `tsconfig.json` files)
- Environment variables scaffolded (`.env` + `.env.example`)
- Prisma schema created (User + Reminder models) & initial migration applied
- Prisma client singleton exported (`packages/db/src/index.ts`)
- Basic SolidStart app bootstrapped (landing page + Tailwind integration)
- Professional README added and pushed to GitHub
- Branch set to `main`, commit history follows conventional commits

### Day 2: Backend (Auth & Reminders)
Status: ✅ Completed backend APIs (auth + reminder); ready to start Day 3 (Frontend Auth & Dashboard)

**Completed Milestones (Day 2):**
- tRPC context with Prisma + JWT user extraction (`packages/api/src/context.ts`)
- tRPC init with public & protected procedures (`packages/api/src/trpc.ts`)
- Auth helpers (hash/verify password, sign/verify JWT) (`packages/api/src/lib/auth.ts`)
- Auth router (register, login, getMe) (`packages/api/src/routers/auth.ts`)
- Reminder router (create, getAll, delete) (`packages/api/src/routers/reminder.ts`)
- API root export (`packages/api/src/index.ts`)
- TS project references & build output cleanup (`tsconfig.json`, web `tsconfig.json`)
- Improved `.gitignore` & separated commits (clean history)

**Latest Feature Commit Messages:**
- `feat(auth): add password & JWT helper utilities`
- `feat(api): add tRPC context and initialization`

### Day 3: Frontend Auth & Dashboard
Status: ✅ Completed frontend implementation; all CRUD operations working

**Completed Milestones (Day 3):**
- tRPC server route handler created (`apps/web/src/routes/api/trpc/[...trpc].ts`)
- tRPC client factory with batching + token headers (`apps/web/src/lib/trpc.ts`)
- Login page implemented with email/password auth (`apps/web/src/routes/login.tsx`)
- Register page with email, phoneNumber, password fields (`apps/web/src/routes/register.tsx`)
- Dashboard page with auth guard, reminder CRUD UI (`apps/web/src/routes/dashboard.tsx`)
- End-to-end testing: register → login → create reminder → view list → delete
- Fixed TypeScript implicit any errors in tRPC handlers
- Token storage using localStorage with 'auth_token' key
- Updated User schema with phoneNumber field for WhatsApp integration

**Latest Commits:**
- `feat(web): add register, login, and dashboard pages with auth flow`

### Day 4: WhatsApp Integration & Background Worker
Status: ✅ Completed; local testing successful; WhatsApp messages delivered

**Completed Milestones (Day 4):**
- WhatsApp service with Twilio integration (`packages/api/src/services/whatsapp.ts`)
- sendWhatsAppReminder function with error handling
- formatReminderMessage helper with emoji formatting
- Background worker with node-cron (`apps/worker/src/index.ts`)
- Cron job running every minute checking for due reminders
- Query optimization: scheduledFor <= now AND sent = false
- Automatic reminder marking as sent after delivery
- Twilio credentials configured in .env
- Comprehensive logging for debugging (from, to, status, error codes)
- End-to-end testing: created reminder → worker sent WhatsApp → message received ✅

**Latest Commits:**
- `feat(worker): add background worker and WhatsApp service`
- `fix(worker): add detailed logging and complete local testing`

**Key Learnings:**
- Twilio WhatsApp Sandbox requires phone numbers in E.164 format (no spaces)
- Users must join sandbox by texting join code before receiving messages
- Worker uses direct Prisma/Twilio dependencies to avoid ESM import issues
- Phone number validation added to future improvements list

### Day 5-7: Deployment & Polish
Status: 🔄 **MVP Complete Locally; Deployment Challenges Encountered**

**Completed:**
- ✅ Full local development workflow working perfectly
- ✅ Database migrated to absolute paths for cross-package compatibility
- ✅ All core features functional: auth, reminders, WhatsApp notifications
- ✅ UX improvements: quick time preset buttons for better usability
- ✅ Comprehensive logging and error handling
- ✅ Technical deep dive documentation created

**Deployment Attempts & Lessons Learned:**
- ❌ Vercel deployment: Encountered Prisma binary issues, serverless bundling complexity
- ❌ Railway deployment: Cron job challenges, pricing considerations
- ❌ Render deployment: Similar serverless limitations
- ✅ Identified root causes: SolidStart + Prisma + serverless = complex configuration
- ✅ Documented alternative tech stacks for future projects

**Current Status:**
- Application is **production-ready locally**
- All features working: register → login → create reminders → WhatsApp delivery
- Database using SQLite (dev) with clear migration path to PostgreSQL
- Worker process successfully sending WhatsApp messages via Twilio
- Codebase is clean, well-documented, and portfolio-ready

**Decision:**
Rather than spending days fighting deployment edge cases, we're focusing on:
1. Documenting learnings (completed - see TECHNICAL_DEEP_DIVE.md)
2. Cataloging achievements for interviews
3. Planning tech stack improvements for next iteration
4. Updating README with honest assessment of deployment challenges

---

## Collaboration Framework

**How we work together:**
- You approve before any new file creation or destructive edit.
- I propose which actions you should do hands-on (learning moments) vs which I can automate (boilerplate).
- Every actionable step follows: WHY → WHAT → ACTION → (optional) COMMIT.
- Conventional commits document incremental progress (feat, fix, chore, docs, refactor, test).
- I maintain the "Current Progress" section for session rehydration.
- If scope of a commit accidentally grows, we amend early for clarity.

**Hands-on moments (you do):**
- Running migrations, starting dev server, debugging runtime errors.
- Writing core business logic (auth flows, validation decisions).
- Designing schema changes or architectural boundaries.

**Automated / boilerplate (I can do after approval):**
- Generating config files (tsconfig, tailwind, postcss, env examples).
- Scaffolding folder structures and empty module shells.
- Simple service wrappers (e.g., Twilio client initialization).

**Learning Prompts:**
- I surface underlying concepts (e.g., tRPC context composition, Prisma relation modeling, Solid reactivity) before implementing.
- I flag potential refactor points but defer premature abstraction until usage patterns emerge.

**Commit Etiquette:**
- One logical unit per commit; summarize changes in bullet form.
- Amend (`git commit --amend`) if description misses included changes.
- Force push only when necessary and safe (solo development context confirmed).

**Resuming in New Session:**
- Copy "Current Progress" + "Next Up" sections.
- Optionally request a diff summary: I can outline changes since last checkpoint.

**Error Handling Approach:**
- Read the full error, classify (config vs logic vs data), reproduce minimally, apply targeted fix.
- Prefer adding small guard rails (validation, try/catch) over broad silent failure.

**Security & Secrets:**
- Never commit secrets (.env ignored; use .env.example for documentation).
- Document required environment variables early; refine as integration expands.

**Quality Gates (later sprint days):**
- Introduce lint/type/check scripts (e.g., `pnpm typecheck`, `pnpm lint`).
- Add minimal tests once core auth + reminder flows stabilize.

---

## Tech Stack Reevaluation & Lessons Learned

### What We Built With (Current Stack)

**Frontend:** SolidStart + SolidJS + Tailwind CSS
**Backend:** tRPC + Zod validation
**Database:** Prisma + SQLite (dev) → PostgreSQL (intended for prod)
**Jobs:** Node-cron + standalone worker
**Auth:** JWT + bcrypt
**Deployment:** Attempted Vercel (frontend) + Railway (worker)

### Honest Assessment

#### What Worked Excellently ✅

1. **TypeScript + tRPC**
   - End-to-end type safety was phenomenal
   - Refactoring with confidence
   - Autocomplete across frontend/backend
   - **Would absolutely use again**

2. **Prisma (in development)**
   - Schema design was intuitive
   - Migrations worked smoothly
   - Type generation excellent
   - **Great for rapid prototyping**

3. **pnpm Workspaces**
   - Monorepo setup was clean
   - Fast installs
   - Good workspace protocol
   - **Solid choice for monorepos**

4. **SolidJS (developer experience)**
   - Learned fine-grained reactivity
   - Smaller bundle than React
   - Good TypeScript support
   - **Great learning experience**

#### What Caused Deployment Pain ❌

1. **SolidStart + Vercel**
   - Preset configuration unclear
   - Smaller ecosystem (fewer solutions online)
   - SSR complications on serverless
   - **Would choose Next.js next time**

2. **Prisma + Serverless**
   - Large bundle size (slow cold starts)
   - Binary target issues
   - Complex bundling configuration
   - **Would consider Drizzle for serverless**

3. **Background Jobs**
   - No good serverless cron solution for long-running tasks
   - Railway works but adds costs
   - Node-cron requires always-on server
   - **Would use Trigger.dev or similar managed service**

4. **SQLite → PostgreSQL**
   - Migration required schema adjustments
   - Connection string changes
   - **Would start with PostgreSQL**

### Recommended Alternative Stacks

For similar projects in the future:

#### Option A: T3 Stack (Battle-Tested)
```
✅ Next.js 14 (App Router)
✅ tRPC (keep the magic!)
✅ Prisma (or Drizzle for serverless)
✅ Tailwind CSS
✅ PlanetScale (managed MySQL)
✅ Trigger.dev (managed background jobs)
✅ Clerk or NextAuth (drop-in auth)
✅ Vercel deployment (zero config)
```

**Why:** Proven, huge community, great Vercel integration

#### Option B: Remix + Fly.io (Full Control)
```
✅ Remix (backend + frontend in one)
✅ PostgreSQL on Fly.io
✅ Prisma (works great on long-running servers)
✅ Node-cron (same process)
✅ Remix Auth
```

**Why:** No serverless limitations, single deployment

#### Option C: Keep Learning Edge
```
✅ SolidStart (fix deployment with community help)
✅ Drizzle (lighter ORM)
✅ Turso (SQLite edge database)
✅ Cloudflare Workers
```

**Why:** Learn cutting-edge tech, accept deployment challenges

### What We Learned

**Technical Skills:**
- Serverless platform constraints and trade-offs
- Binary bundling for different architectures
- Monorepo deployment strategies
- Database ORM performance implications
- JWT authentication implementation
- Background job processing patterns
- API design with type safety

**Professional Skills:**
- Evaluating technology trade-offs (bleeding edge vs. proven)
- Debugging complex deployment issues systematically
- Reading between framework documentation
- Knowing when to pivot vs. persist
- Documenting learnings for future projects
- Honest technical assessment (not hiding failures)

### For Interviews

**How to present this project honestly:**

❌ **Don't say:** "It's fully deployed to production"
✅ **Do say:** "I built a production-ready app locally and attempted multiple deployment strategies. I documented the challenges thoroughly and identified root causes. This taught me about serverless constraints and informed my tech stack choices for future projects."

❌ **Don't say:** "I chose SolidStart because it's better"
✅ **Do say:** "I chose SolidStart to learn modern reactive patterns beyond React. While the DX was excellent, deployment proved challenging. For my next project, I'd choose Next.js for production stability while keeping the lessons learned about reactivity."

❌ **Don't say:** "Everything went smoothly"
✅ **Do say:** "I encountered Prisma bundling issues on Vercel serverless. I systematically debugged by reading docs, testing configurations, and understanding how serverless platforms handle binaries. This deepened my understanding of deployment architecture."

**Key message:** *"I build, I learn, I adapt. Challenges are learning opportunities."*

---

## Tech Stack (Original Plan)

### Core Technologies
- **Frontend:** SolidStart (SolidJS meta-framework)
- **Backend:** tRPC (end-to-end type-safe API)
- **Database:** Prisma + SQLite (dev) → PostgreSQL (production)
- **Validation:** Zod (runtime + TypeScript types)
- **Notifications:** Twilio WhatsApp Sandbox API
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (frontend), Railway (background jobs)

### Why This Stack?
- **End-to-end TypeScript** - Deepens TS knowledge, type safety across entire app
- **Modern patterns** - tRPC showcases cutting-edge web development
- **Monorepo** - Professional project structure
- **Portfolio value** - Demonstrates understanding of modern full-stack architecture

---

## Project Structure

```
whatsapp-reminder-app/
├── apps/
│   └── web/                 # SolidStart application
│       ├── src/
│       │   ├── routes/      # File-based routing
│       │   ├── components/  # Reusable UI components
│       │   └── lib/         # tRPC client, utilities
│       └── package.json
├── packages/
│   ├── db/                  # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── api/                 # tRPC routers (optional separation)
│       ├── src/
│       │   ├── routers/     # Auth, reminders, etc.
│       │   └── context.ts   # tRPC context (auth, db)
│       └── package.json
├── pnpm-workspace.yaml
├── package.json             # Root package.json
├── .env                     # Environment variables
└── README.md
```

---

## MVP Scope

### ✅ What's IN
- User authentication (register, login, logout)
- Create reminders (title, message, scheduled time)
- View all user's reminders
- Delete reminders
- WhatsApp notifications when reminder is due
- Basic responsive dashboard
- Deployed to production

### ❌ What's OUT (Future Features)
- AI-generated reminder messages
- Location-based reminders
- Medicine tracking
- Procrastination helper
- Complex filtering/sorting
- User profiles/settings
- Email/SMS alternatives
- Update/edit reminders (delete & recreate for MVP)
- **Phone number validation** - Add E.164 format validation (no spaces, correct country code format) to prevent WhatsApp delivery failures

---

## 7-Day Sprint Plan

### Day 1: Foundation (3-4 hours)

#### Task 1: Project Init & Dependencies
**Actions:**
1. Create GitHub repository
2. Initialize pnpm workspace
3. Set up basic monorepo structure
4. Install dependencies:
   ```bash
   # Root
   pnpm add -D typescript @types/node

   # apps/web
   pnpm add solid-start @solidjs/router @solidjs/start
   pnpm add @trpc/server @trpc/client @tanstack/solid-query
   pnpm add tailwindcss

   # packages/db
   pnpm add prisma @prisma/client
   pnpm add -D tsx

   # Shared
   pnpm add zod jsonwebtoken bcrypt
   pnpm add -D @types/jsonwebtoken @types/bcrypt
   ```
5. Configure TypeScript for monorepo
6. Set up `.env` files

**Deliverable:** Project runs with `pnpm dev` (even if empty)

---

#### Task 2: Database Schema (Minimal)
**Actions:**
1. Create Prisma schema in `packages/db/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }

   generator client {
     provider = "prisma-client-js"
   }

   model User {
     id        String     @id @default(cuid())
     email     String     @unique
     password  String
     createdAt DateTime   @default(now())
     reminders Reminder[]
   }

   model Reminder {
     id           String   @id @default(cuid())
     userId       String
     title        String
     message      String
     scheduledFor DateTime
     sent         Boolean  @default(false)
     createdAt    DateTime @default(now())
     user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@index([userId])
     @@index([scheduledFor, sent])
   }
   ```

2. Run migrations:
   ```bash
   cd packages/db
   pnpm prisma migrate dev --name init
   pnpm prisma generate
   ```

3. Create seed data (optional)

**Deliverable:** Prisma Client generated, can query DB

---

### Day 2: Backend Complete (4-5 hours)

#### Task 3: Auth tRPC Procedures
**Actions:**
1. Set up tRPC router structure
2. Create context (includes Prisma client, auth user)
3. Implement procedures:
   - `auth.register` - Hash password with bcrypt, create user
   - `auth.login` - Verify credentials, return JWT
   - `auth.getMe` - Get current user (protected)
4. Create `protectedProcedure` helper
5. Test with Postman/curl

**Key files:**
- `packages/api/src/context.ts`
- `packages/api/src/routers/auth.ts`
- `packages/api/src/root.ts` (combines routers)

**Deliverable:** Can register, login, and get user via API calls

---

#### Task 4: Reminder CRUD Procedures
**Actions:**
1. Create reminder router with procedures:
   - `reminder.create` - Create reminder (protected)
   - `reminder.getAll` - Get user's reminders (protected)
   - `reminder.delete` - Delete by ID (protected)
2. Add Zod validation schemas
3. Ensure `userId` from auth context
4. Test all endpoints with Postman

**Key files:**
- `packages/api/src/routers/reminder.ts`
- `packages/api/src/schemas/reminder.ts` (Zod schemas)

**Deliverable:** Full CRUD working via tRPC procedures

---

### Day 3: Frontend Auth (4 hours)

#### Task 5: Auth UI + tRPC Client
**Actions:**
1. Set up SolidStart app
2. Configure tRPC client with solid-query
3. Create routes:
   - `/login` - Login form
   - `/register` - Registration form
4. Implement auth flow:
   - Store JWT in localStorage
   - Create auth context/store
   - Protected route wrapper
5. Basic Tailwind styling

**Key files:**
- `apps/web/src/lib/trpc.ts` (tRPC client)
- `apps/web/src/routes/login.tsx`
- `apps/web/src/routes/register.tsx`
- `apps/web/src/lib/auth.tsx` (auth context)

**Deliverable:** Can register, login, logout in UI

---

### Day 3-4: Dashboard (4-6 hours)

#### Task 6: Reminder Dashboard UI
**Actions:**
1. Create dashboard route (`/dashboard`)
2. Fetch reminders with tRPC query
3. Build reminder creation form:
   - Title input
   - Message textarea
   - Date/time picker (HTML5 `datetime-local`)
4. Display reminder list
5. Add delete button per reminder
6. Basic loading/error states

**Key files:**
- `apps/web/src/routes/dashboard.tsx`
- `apps/web/src/components/ReminderForm.tsx`
- `apps/web/src/components/ReminderList.tsx`

**Deliverable:** Can create, view, delete reminders in UI

---

### Day 4: WhatsApp Integration (2-3 hours)

#### Task 7: WhatsApp API Setup (Twilio)
**Actions:**
1. Sign up for Twilio (free account)
2. Activate WhatsApp Sandbox:
   - Navigate to Messaging → Try WhatsApp
   - Get sandbox number and join code
   - Text join code from your phone
3. Get credentials:
   - Account SID
   - Auth Token
   - Sandbox WhatsApp number
4. Install Twilio SDK: `pnpm add twilio`
5. Create service function:
   ```typescript
   // packages/api/src/services/whatsapp.ts
   import twilio from 'twilio';

   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID!,
     process.env.TWILIO_AUTH_TOKEN!
   );

   export async function sendWhatsAppReminder(
     to: string, 
     message: string
   ) {
     return await client.messages.create({
       from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
       to: `whatsapp:${to}`,
       body: message
     });
   }
   ```
6. Test by manually sending a message

**Deliverable:** Can send WhatsApp messages from Node.js

---

### Day 5: Background Jobs (3-4 hours)

#### Task 8: Background Job (Simple)
**Actions:**
1. Create background worker script:
   ```typescript
   // apps/worker/index.ts
   import cron from 'node-cron';
   import { prisma } from '@repo/db';
   import { sendWhatsAppReminder } from '@repo/api/services/whatsapp';

   // Run every minute
   cron.schedule('* * * * *', async () => {
     const dueReminders = await prisma.reminder.findMany({
       where: {
         sent: false,
         scheduledFor: {
           lte: new Date()
         }
       },
       include: {
         user: true
       }
     });

     for (const reminder of dueReminders) {
       try {
         await sendWhatsAppReminder(
           reminder.user.phoneNumber, // Add phone to schema!
           `🔔 ${reminder.title}\n\n${reminder.message}`
         );
         
         await prisma.reminder.update({
           where: { id: reminder.id },
           data: { sent: true }
         });
       } catch (error) {
         console.error('Failed to send reminder:', error);
       }
     }
   });
   ```

2. **Note:** Need to add `phoneNumber` field to User schema
3. Update registration to collect phone number
4. Test locally by creating reminder 1 minute in future

**Deliverable:** Reminders automatically sent via WhatsApp

---

### Day 5-6: Testing (3-4 hours)

#### Task 9: Integration Testing
**Actions:**
1. Test complete user flow:
   - Register with phone number
   - Login
   - Create reminder (1-2 minutes in future)
   - Wait and receive WhatsApp
2. Test edge cases:
   - Past scheduled times
   - Invalid phone numbers
   - Concurrent reminders
3. Add basic error handling:
   - Form validation feedback
   - API error messages
   - Network errors
4. Fix critical bugs

**Deliverable:** App works end-to-end locally

---

### Day 6-7: Deployment (3-4 hours)

#### Task 10: Deploy to Production
**Actions:**

1. **Database - Vercel Postgres or Supabase:**
   ```bash
   # Update Prisma schema
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   
   # Run migrations
   pnpm prisma migrate deploy
   ```

2. **Frontend - Vercel:**
   - Connect GitHub repo to Vercel
   - Configure build settings:
     - Framework: SolidStart
     - Root Directory: `apps/web`
   - Add environment variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - (tRPC endpoints work as serverless functions)

3. **Background Worker - Railway:**
   - Create new project
   - Deploy worker script
   - Add environment variables:
     - `DATABASE_URL`
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_WHATSAPP_NUMBER`
   - Ensure always running (not serverless)

4. **Test in production:**
   - Register new account
   - Create test reminder
   - Verify WhatsApp delivery

**Deliverable:** App live and accessible via URL

---

### Day 7: Polish (2-3 hours)

#### Task 11: Documentation & Demo
**Actions:**

1. **README.md:**
   ```markdown
   # WhatsApp Reminder App

   A full-stack TypeScript reminder application with WhatsApp notifications.

   ## Features
   - 🔐 Secure authentication
   - ⏰ Schedule reminders
   - 📱 WhatsApp notifications via Twilio
   - 🎨 Responsive dashboard

   ## Tech Stack
   - **Frontend:** SolidStart, Tailwind CSS
   - **Backend:** tRPC, Prisma, PostgreSQL
   - **Notifications:** Twilio WhatsApp API
   - **Deployment:** Vercel + Railway

   ## Why This Stack?
   [Explain your technical decisions]

   ## Local Development
   [Setup instructions]

   ## Architecture
   [Simple diagram or explanation]

   ## Screenshots
   [Add 2-3 screenshots]

   ## Demo
   [Link to video or live site]
   ```

2. **Architecture diagram** (simple, use Excalidraw or ASCII)

3. **Screenshots:**
   - Login page
   - Dashboard with reminders
   - WhatsApp notification on phone

4. **Demo video** (30-60 seconds):
   - Show creating reminder
   - Show receiving WhatsApp message
   - Record with Loom or OBS

5. **Polish GitHub repo:**
   - Add `.gitignore`
   - Remove sensitive data
   - Add license (MIT)
   - Clean up code comments

**Deliverable:** Portfolio-ready project

---

## Environment Variables

### Development (.env)
```bash
# Database
DATABASE_URL="file:./dev.db"

# Auth
JWT_SECRET="your-super-secret-key-change-in-production"

# Twilio WhatsApp
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_WHATSAPP_NUMBER="+14155238886"
```

### Production
Same variables but:
- `DATABASE_URL` → PostgreSQL connection string
- `JWT_SECRET` → Generate secure random string
- Twilio credentials → Same (sandbox or production)

---

## Success Metrics (MVP)

- [ ] User can register and login
- [ ] User can create reminders with title, message, time
- [ ] User can view all their reminders
- [ ] User can delete reminders
- [ ] Reminders trigger WhatsApp messages at scheduled time
- [ ] App is deployed and publicly accessible
- [ ] GitHub repo has clear README with demo
- [ ] Code is clean and well-structured

---

## Future Enhancements (Post-MVP)

### Phase 2: Intelligence
- AI-generated funny/meaningful reminder messages (OpenAI API)
- Smart time suggestions based on user patterns
- Recurring reminders

### Phase 3: Location
- Location-based reminders (geofencing)
- Map integration for shopping list reminders
- Proximity notifications

### Phase 4: Multi-Channel
- Email reminders (Resend API)
- SMS fallback (Twilio SMS)
- Push notifications (Progressive Web App)

### Phase 5: Collaboration
- Shared reminders (family/teams)
- Reminder templates
- Calendar integration (Google Calendar API)

---

## Learning Objectives

By completing this project, you will demonstrate:

1. **Full-Stack TypeScript Mastery**
   - End-to-end type safety with tRPC
   - Advanced TypeScript patterns (generics, inference)
   - Monorepo architecture

2. **Modern Web Development**
   - SolidJS reactive primitives
   - Server-side rendering with SolidStart
   - RPC vs REST API design

3. **Database & ORM**
   - Prisma schema design
   - Migrations and type generation
   - Relational data modeling

4. **Authentication & Security**
   - JWT implementation
   - Password hashing
   - Protected routes and procedures

5. **Third-Party Integration**
   - Twilio WhatsApp API
   - Webhook handling
   - External service error handling

6. **Background Processing**
   - Job scheduling with cron
   - Asynchronous task processing
   - Retry logic and fault tolerance

7. **DevOps & Deployment**
   - Vercel deployment (frontend + serverless)
   - Railway deployment (background workers)
   - Environment variable management
   - CI/CD basics

---

## Common Pitfalls to Avoid

### 1. Scope Creep
- **Problem:** Adding features mid-MVP
- **Solution:** Stick to the plan. Write "Future Enhancements" list instead

### 2. Over-Engineering
- **Problem:** Complex abstractions too early
- **Solution:** Start simple, refactor later with real usage patterns

### 3. Ignoring Errors
- **Problem:** Happy path only
- **Solution:** Add basic try/catch and user feedback early

### 4. Poor Time Estimation
- **Problem:** Underestimating tasks
- **Solution:** Track actual time, adjust remaining tasks

### 5. No Testing During Development
- **Problem:** Bugs pile up
- **Solution:** Test each task completion before moving on

---

## Daily Time Commitment

**Recommended:** 3-5 hours per day

**Flexible schedule:**
- **Weekdays:** 2-3 hours (evenings)
- **Weekends:** 5-6 hours (catch up or get ahead)

**Total time investment:** ~25-30 hours

---

## Resources

### Documentation
- **tRPC:** https://trpc.io/docs
- **SolidStart:** https://start.solidjs.com
- **Prisma:** https://www.prisma.io/docs
- **Twilio WhatsApp:** https://www.twilio.com/docs/whatsapp
- **Zod:** https://zod.dev

### Tutorials
- tRPC + SolidStart: Search for "tRPC SolidStart tutorial"
- Prisma quickstart: https://www.prisma.io/docs/getting-started
- Twilio WhatsApp Sandbox: https://www.twilio.com/docs/whatsapp/sandbox

### Tools
- **Database GUI:** Prisma Studio (`pnpm prisma studio`)
- **API Testing:** Postman or Thunder Client (VS Code extension)
- **Design:** Excalidraw (architecture diagrams)
- **Screen Recording:** Loom or OBS Studio

---

## Checklist: Pre-Development

Before starting Day 1:

- [ ] Choose a project name
- [ ] Create GitHub account (if needed)
- [ ] Install Node.js (v18+)
- [ ] Install pnpm (`npm install -g pnpm`)
- [ ] Install VS Code + extensions (Prisma, Tailwind IntelliSense)
- [ ] Sign up for Twilio (don't wait - do it now)
- [ ] Choose database host (Vercel Postgres or Supabase)
- [ ] Clear 3-5 hours per day for next week
- [ ] Notify friends/family you'll be focused
- [ ] Set up distraction-free workspace

---

## Motivation & Mindset

### Remember:
- **Perfection is the enemy of done** - Ship MVP first, polish later
- **Learning > Polish** - Focus on understanding concepts deeply
- **Document as you go** - Write README sections daily
- **Celebrate small wins** - Each task completion is progress
- **Ask for help** - Use AI assistants, Discord communities, docs

### When Stuck (>30 min):
1. Read the error message carefully
2. Check official documentation
3. Search GitHub issues
4. Ask AI assistant with specific error
5. Take a break and come back fresh
6. Simplify: remove complexity, get basic version working first

---

## Portfolio Presentation Tips

When showing this to recruiters/interviewers:

### Highlight:
1. **Technical decisions:** "I chose tRPC over REST because..."
2. **Trade-offs:** "I used SQLite initially for speed, then migrated to Postgres"
3. **Learning:** "This was my first time with tRPC, and I learned..."
4. **Real-world thinking:** "I used Twilio sandbox for MVP but would migrate to..."

### Demo flow:
1. Show the live app (30 sec)
2. Walk through code (1-2 min): Show tRPC type inference, Prisma schema
3. Explain architecture (1 min): Diagram showing frontend, backend, jobs
4. Discuss future features (30 sec): What you'd add next
5. Invite questions

---

## Next Steps After MVP

Once MVP is complete (Day 7), you have options:

### Option A: Polish This Project
- Add AI message generation
- Implement location-based reminders
- Add analytics dashboard

### Option B: Start Project #2
- Reuse this stack knowledge
- Build something different (expense tracker, habit tracker, etc.)
- Faster development (3-4 days instead of 7)

### Option C: Portfolio Website
- Showcase all 5 projects
- Write blog posts about learnings
- Deploy to custom domain

---

## Contact & Support

If you need help during development:

- **tRPC Discord:** https://trpc.io/discord
- **SolidJS Discord:** https://discord.com/invite/solidjs
- **Prisma Discord:** https://pris.ly/discord
- **Stack Overflow:** Tag questions with `trpc`, `solidjs`, `prisma`

---

## Final Checklist: MVP Complete

- [ ] App deployed and accessible via URL
- [ ] GitHub repo public with README
- [ ] Can register, login, logout
- [ ] Can create and view reminders
- [ ] WhatsApp notifications work
- [ ] Code is clean and commented
- [ ] Screenshots added to README
- [ ] Demo video recorded
- [ ] Environment variables documented
- [ ] Future enhancements list created

---

**Good luck! You've got this. 🚀**

Remember: The goal isn't perfection—it's a working product that demonstrates your ability to learn new technologies and ship features. Focus on completing the MVP, then iterate.

Start with Task 1 and work through sequentially. Test each task before moving on. Document your learnings. And most importantly: **keep shipping**.

---

*Plan created: November 11, 2025*  
*Target completion: November 18, 2025*  
*Project #1 of 5 for November portfolio sprint*
