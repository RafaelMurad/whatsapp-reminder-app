# Project Context - Quick Resume

**Purpose:** When starting a new Claude Code session or context window, read this first for instant project context.

**Last Updated:** November 15, 2025

---

## Current Status: SolidJS → React Migration (Day 1)

**What's working:**
- ✅ Complete WhatsApp reminder app built in SolidJS
- ✅ Backend fully functional (tRPC, Prisma, auth, worker)
- ✅ Local development works perfectly
- ✅ Database using absolute paths (fixed SQLite connection issues)

**Current task:**
- 🔄 Migrating frontend from SolidJS to React/Next.js
- 📍 On Day 1 of migration plan (see [plans/migration.md](plans/migration.md))

---

## Project Overview

**What it is:**
Full-stack WhatsApp reminder app - users register, create reminders, get WhatsApp notifications at scheduled times.

**Tech stack (current):**
- Frontend: SolidJS + SolidStart (MIGRATING TO REACT)
- Backend: tRPC + Prisma + Zod (KEEPING 100%)
- Database: SQLite (dev) → PostgreSQL (production)
- Worker: Node-cron + Twilio WhatsApp API (KEEPING 100%)
- Monorepo: pnpm workspaces

**Tech stack (target):**
- Frontend: Next.js 15 + React + shadcn/ui + TanStack
- Backend: Same (tRPC + Prisma + Zod)
- Database: Vercel Postgres
- Worker: Same (deploy to Railway)

---

## Why Migrating?

**Short version:**
Built complete app in SolidJS. Deployment was hell. React has 200x more jobs. Can reuse 70% of work (entire backend). Migration = 5-7 days vs new project = 6+ weeks.

**Read more:**
- [decisions/tech-stack.md](decisions/tech-stack.md) - Full decision framework
- [reference/technical-deep-dive.md](reference/technical-deep-dive.md) - Technical depth

---

## Key Files & Locations

```
whatsapp-reminder-app/
├── apps/
│   ├── web/              # SolidJS frontend (TO BE ARCHIVED)
│   └── worker/           # Background cron job (KEEPING)
├── packages/
│   ├── api/              # tRPC routers (KEEPING 100%)
│   └── db/               # Prisma schema (KEEPING 100%)
└── docs/
    ├── context.md                      # This file
    ├── decisions/tech-stack.md         # Why I chose what
    ├── plans/migration.md              # 5-7 day migration roadmap
    └── reference/technical-deep-dive.md # Deep explanations
```

**Important path:**
Database: `/Users/rafael.murad/Documents/Training/whatsapp-reminder-app/packages/db/data/dev.db`

---

## Recent Fixes & Decisions

### Database Path Fix (Nov 13)
Changed `apps/web/.env` from relative to absolute path:
```
# Before (broken)
DATABASE_URL=file:../../packages/db/data/dev.db

# After (works)
DATABASE_URL=file:/Users/rafael.murad/Documents/Training/whatsapp-reminder-app/packages/db/data/dev.db
```

### Tech Decisions (Nov 14)
- **React/Next.js**: Industry standard, proven deployment
- **shadcn/ui**: Copy-paste components, learn Radix patterns
- **TanStack Form**: Framework-agnostic, transfers across projects
- **Vercel**: Zero-config Next.js deployment
- **Railway**: Background worker deployment

---

## Current Migration Progress

### ✅ Completed
1. Documentation written (concise, first-person)
2. Organized docs into `docs/` folder structure
3. Created docs index and organization system

### 🔄 Next Tasks (Day 1)
1. Archive SolidJS web app to `archive/solidjs-version/`
2. Create Next.js 15 app (TypeScript + Tailwind)
3. Install shadcn/ui
4. Install TanStack Query + Form
5. Connect tRPC client to backend
6. Test one tRPC call

See [plans/migration.md](plans/migration.md) for full day-by-day breakdown.

---

## Important Context for AI Assistant

### My Working Style
- **Voice**: First-person, concise, no bloat
- **Approach**: Build fast, learn by doing
- **Documentation**: Human-sounding, not corporate/AI-generated
- **Focus**: Show genuine interest in tech, keep career strategy implicit

### Collaboration Agreement
- Ask before creating new files
- Use TodoWrite tool to track progress
- Mark tasks completed immediately (don't batch)
- Keep exactly ONE task in_progress at a time
- Concise communication

### Project Goals
1. **Primary**: Complete React migration in 5-7 days
2. **Secondary**: Use as ongoing learning lab for new tech
3. **Portfolio**: Production-ready demo with live URL
4. **Learning**: Master Next.js, React, shadcn/ui, TanStack

---

## Quick Commands

```bash
# Dev (current SolidJS)
pnpm dev

# Database
pnpm db:studio
pnpm db:migrate

# Worker
pnpm worker
```

---

## When Resuming Work

**Read in order:**
1. This file (docs/context.md) - Current state
2. docs/plans/migration.md - Detailed roadmap
3. Check git status - See latest changes

**Quick start prompt for new session:**
```
I'm working on migrating my WhatsApp reminder app from SolidJS to React/Next.js.
Read docs/context.md for current state and docs/plans/migration.md for roadmap.
I'm on Day 1 of migration. Let's continue from where we left off.
```

---

## Git Status (as of last update)

Current branch: `main`
Untracked files:
- docs/ (entire documentation folder)

**Note:** Ready to commit organized documentation structure.

---

**Update this file whenever:**
- Major task completed
- Important decision made
- Blocked on something
- Switching context windows
- Ending work session
