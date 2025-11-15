# Documentation

All project documentation, organized and version-controlled.

**Last Updated:** November 15, 2025

---

## 📁 Structure

```
docs/
├── README.md                          # This file
├── context.md                         # Session continuity (read first!)
├── decisions/                         # Technology decisions & rationale
│   └── tech-stack.md
├── plans/                            # Migration plans & roadmaps
│   └── migration.md
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

### [plans/migration.md](plans/migration.md)
**Purpose:** Detailed migration roadmap
**Update:** Daily during migration, check off completed tasks
**Use:** Day-by-day execution plan

Contains:
- 5-7 day migration timeline
- Daily breakdown with checklists
- Success criteria
- Alternative paths if ahead/behind

### [reference/technical-deep-dive.md](reference/technical-deep-dive.md)
**Purpose:** Deep technical explanations
**Update:** When learning new concepts or for interviews
**Use:** Interview preparation, concept review

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
| migration.md | ✅ | ✅✅ | ❌ |
| technical-deep-dive.md | ✅✅✅ | ❌ | ✅✅✅ |

---

**This documentation structure evolves with the project. Add new categories as needed.**
