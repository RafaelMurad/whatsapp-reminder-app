# Documentation

All project documentation, organized and version-controlled.

**Last Updated:** November 15, 2025

---

## 📁 Structure

```
docs/
├── README.md                          # This file
├── context.md                         # Session continuity (read first!)
├── migration-journal.md               # Day-by-day migration log
├── decisions/                         # Technology decisions & rationale
│   └── tech-stack.md
├── learnings/                         # Detailed concept explanations
│   └── migration-learnings.md         # Technical deep dives
├── plans/                            # Migration plans & roadmaps
│   ├── mvp-original.md               # Original SolidJS MVP plan
│   └── migration.md                  # React migration roadmap
└── reference/                        # Deep technical documentation
    └── technical-deep-dive.md
```

---

## 🚀 Quick Start

**New to this project?** Read in order:
1. [context.md](context.md) - Current state & quick overview
2. [plans/migration.md](plans/migration.md) - Where we're going
3. [decisions/tech-stack.md](decisions/tech-stack.md) - Why we chose what

**Resuming work?** Just read:
- [context.md](context.md) - Updated with current state

---

## 📚 Document Guide

### [context.md](context.md)
**Purpose:** Session continuity
**Update:** Every major task or before ending session
**Use:** Quick resume for new sessions

Contains:
- Current project state
- What's working, what's in progress
- Recent fixes and decisions
- Where to resume work

### [migration-journal.md](migration-journal.md)
**Purpose:** Day-by-day migration log
**Update:** After each migration day completion
**Use:** Track decisions, learnings, blockers

Contains:
- What was accomplished each day
- Technical decisions and rationale
- Product considerations discovered
- Blockers and resolutions

### [decisions/tech-stack.md](decisions/tech-stack.md)
**Purpose:** Technology decisions & rationale
**Update:** When adding new tech or making major decisions
**Use:** Explain technology choices in interviews

Contains:
- SolidJS → React migration decision
- UI library choice (shadcn/ui)
- Form library choice (TanStack Form)
- Deployment platform choices
- Decision framework for future tech

### [plans/mvp-original.md](plans/mvp-original.md)
**Purpose:** Original MVP plan and development log
**Update:** Historical record (completed)
**Use:** Reference for what was built in SolidJS

Contains:
- Original 7-day MVP timeline
- Development progress logs
- Tech stack evaluation
- Lessons learned from SolidJS project
- Deployment challenges and decisions

### [plans/migration.md](plans/migration.md)
**Purpose:** Detailed migration roadmap
**Update:** Daily during migration, check off completed tasks
**Use:** Day-by-day execution plan

Contains:
- 5-7 day migration timeline
- Daily breakdown with checklists
- Success criteria
- Alternative paths if ahead/behind

### [learnings/migration-learnings.md](learnings/migration-learnings.md)
**Purpose:** Detailed technical concepts from migration
**Update:** During migration, when learning new patterns
**Use:** Reference for React patterns, interview prep

Contains:
- SolidJS Signals vs React Hooks comparison
- Framework migration strategies
- Next.js App Router architecture
- Authentication patterns (JWT, cookies)
- tRPC version compatibility lessons
- Product considerations (legal, security, scalability)

### [reference/technical-deep-dive.md](reference/technical-deep-dive.md)
**Purpose:** Deep technical explanations (SolidJS version)
**Update:** Historical reference
**Use:** Interview preparation for SolidJS learnings

Contains:
- Authentication & Security (JWT, bcrypt)
- Database & ORM (Prisma)
- tRPC type-safe APIs
- SolidJS & Reactivity concepts
- Background jobs & Cron
- Monorepo architecture
- Interview talking points

---

## 🔄 When to Update

**Daily (during active development):**
- [x] Update [context.md](context.md) with progress
- [x] Check off items in [plans/migration.md](plans/migration.md)

**When making tech decisions:**
- [x] Add entry to [decisions/tech-stack.md](decisions/tech-stack.md)
- [x] Document rationale and alternatives considered

**When learning something new:**
- [x] Add to [reference/technical-deep-dive.md](reference/technical-deep-dive.md)
- [x] Include "why" and "how it works"

**Before ending session:**
- [x] Update [context.md](context.md) with current state
- [x] Note any blockers or next steps

---

## 📝 Writing Style Guide

**Keep it:**
- First-person ("I chose" not "we chose")
- Concise (no bloat)
- Human-sounding (not corporate/AI-generated)
- Honest (document challenges, not just wins)

**Show:**
- Genuine interest in technology
- Learning mindset
- Problem-solving process
- Decision-making rationale

**Avoid:**
- Overly formal language
- Job-hunting focus (keep implicit)
- AI-sounding corporate speak
- Hiding failures or challenges

---

## 🎯 Document Purposes

| Document | Interview Use | Resume Work | Learn Concept |
|----------|--------------|-------------|---------------|
| context.md | ❌ | ✅✅✅ | ❌ |
| tech-stack.md | ✅✅ | ✅ | ✅ |
| mvp-original.md | ✅ | ❌ | ✅ |
| migration.md | ✅ | ✅✅ | ❌ |
| technical-deep-dive.md | ✅✅✅ | ❌ | ✅✅✅ |

---

**This documentation structure evolves with the project. Add new categories as needed.**
