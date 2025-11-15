# 📱 WhatsApp Reminder App

> A full-stack TypeScript reminder application with WhatsApp notifications - demonstrating modern web development practices and end-to-end type safety.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-000000?logo=next.js)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-10.45-398ccb)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Project Overview

A portfolio project built to showcase full-stack TypeScript development, focusing on:
- **End-to-end type safety** with tRPC
- **Modern frontend** with SolidJS and SolidStart
- **Professional architecture** using monorepo patterns
- **Real-world integration** with Twilio WhatsApp API
- **Production deployment** on Vercel + Railway

**Timeline:** 7-day MVP sprint (Nov 11-18, 2025) | 5-7 day React migration (Nov 15-21, 2025)
**Status:** 🔄 Migrating SolidJS → React/Next.js | Day 1 Complete, Day 2 Starting

---

## ✨ Features

### MVP ✅ Complete
- [x] Monorepo setup with pnpm workspaces
- [x] User authentication (register/login/logout with JWT)
- [x] Create and manage reminders (CRUD operations)
- [x] WhatsApp notifications via Twilio
- [x] Responsive dashboard UI with Tailwind CSS
- [x] Background worker with cron scheduling
- [x] Quick time presets (+1min, +5min, +15min, +1hour)
- [x] Comprehensive error handling and logging
- [x] Type-safe API with tRPC
- [x] Database schema with Prisma ORM
- [ ] Production deployment (challenges documented, see [docs/reference/technical-deep-dive.md](docs/reference/technical-deep-dive.md))

### Future Enhancements
- AI-generated reminder messages (OpenAI)
- Location-based reminders
- Recurring reminders
- Multi-channel notifications (Email, SMS)
- Shared reminders for teams

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) folder:

- **[Context](docs/context.md)** - Quick project overview and current state
- **[Tech Stack Decisions](docs/decisions/tech-stack.md)** - Why I chose each technology
- **[Migration Plan](docs/plans/migration.md)** - SolidJS → React migration roadmap
- **[Technical Deep Dive](docs/reference/technical-deep-dive.md)** - In-depth technical explanations

See [docs/README.md](docs/README.md) for the complete documentation index.

---

## 🔄 Framework Migration Journey

**Why migrate from SolidJS to React?**

This app was originally built with SolidJS to learn fine-grained reactivity and signals. After completing a fully functional MVP locally, I'm migrating to React/Next.js for:
- **Industry alignment** - React dominates the job market (10,000+ positions vs <50 for SolidJS)
- **Ecosystem access** - Larger library selection, better tooling, proven deployment
- **Portfolio impact** - Demonstrates framework-agnostic thinking and migration expertise
- **Future potential** - If this becomes a real product, React enables team collaboration

**What's preserved:** 70% of the codebase (entire backend: tRPC, Prisma, auth, worker, database schema)

**Migration progress:** Track at [docs/plans/migration.md](docs/plans/migration.md)
**SolidJS version:** Preserved at [archive/solidjs-version/](archive/solidjs-version/) for comparison
**Migration learnings:** See [docs/learnings/migration-learnings.md](docs/learnings/migration-learnings.md)

---

## 🛠️ Tech Stack

### Frontend (Migrated to React)
- **[Next.js 16](https://nextjs.org/)** - React meta-framework (App Router, RSC)
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Accessible component library (Radix UI)
- **[TanStack Query v4](https://tanstack.com/query)** - Data fetching & caching
- **[TanStack Form](https://tanstack.com/form)** - Framework-agnostic forms

**Original:** SolidJS version preserved in `archive/solidjs-version/`

### Backend (Unchanged - 100% Reused)
- **[tRPC v10](https://trpc.io/)** - End-to-end type-safe APIs
- **[Prisma](https://www.prisma.io/)** - Type-safe ORM
- **[Zod](https://zod.dev/)** - Runtime validation & TypeScript types

### Infrastructure
- **[pnpm Workspaces](https://pnpm.io/)** - Monorepo package management
- **SQLite** (development) → **PostgreSQL** (production target)
- **[Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)** - Message delivery
- **JWT + bcrypt** - Authentication & security

### Deployment (Target)
- **Vercel** - Frontend + API routes
- **Railway** - Background worker (cron jobs)
- **Vercel Postgres** - Production database

---

## 📁 Project Structure

```
whatsapp-reminder-app/
├── apps/
│   ├── web/                 # Next.js 16 App (React 19)
│   │   ├── app/             # App Router
│   │   │   ├── (auth)/      # Login, register
│   │   │   ├── (protected)/ # Dashboard (auth required)
│   │   │   └── api/trpc/    # tRPC route handler
│   │   ├── components/ui/   # shadcn/ui components
│   │   └── lib/             # tRPC client, utils
│   └── worker/              # Background jobs (UNCHANGED)
├── archive/
│   └── solidjs-version/     # Original SolidJS app (preserved)
├── packages/
│   ├── api/                 # tRPC routers (UNCHANGED)
│   │   ├── routers/         # Auth, reminders, etc.
│   │   ├── services/        # WhatsApp integration
│   │   └── lib/             # Auth helpers
│   └── db/                  # Prisma schema (UNCHANGED)
│       └── prisma/schema.prisma
└── docs/                    # Project documentation
    ├── context.md           # Session continuity
    ├── plans/migration.md   # Migration roadmap
    └── learnings/           # Detailed learnings
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **pnpm** v8+ (`npm install -g pnpm` or `volta install pnpm`)
- **Twilio account** (for WhatsApp - [Sign up free](https://www.twilio.com/try-twilio))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/whatsapp-reminder-app.git
   cd whatsapp-reminder-app
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Twilio credentials
   ```

4. **Initialize the database:**
   ```bash
   pnpm db:migrate
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

---

## 🔧 Development Scripts

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Database commands
pnpm db:studio    # Open Prisma Studio (DB GUI)
pnpm db:migrate   # Run database migrations

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

---

## 🏗️ Architecture

### Why This Stack?

**End-to-end TypeScript:**
- Single language across entire stack
- Shared types between frontend/backend
- Catch errors at compile time, not runtime

**tRPC Benefits:**
- No API documentation needed (types ARE the docs)
- Autocomplete for API calls in frontend
- Refactor safely (rename breaks immediately visible)

**Monorepo Advantages:**
- One `git clone`, one `pnpm install`
- Share code between packages
- Deploy frontend/backend independently

**SolidJS Choice:**
- Smaller bundle size than React
- True reactivity (no virtual DOM)
- Growing ecosystem, good for learning

---

## 📚 Learning Objectives

This project demonstrates proficiency in:

1. **Modern Full-Stack Development**
   - SolidJS reactive patterns
   - Server-side rendering (SSR)
   - Type-safe API design with tRPC

2. **Database & ORM**
   - Prisma schema design
   - Relational data modeling
   - Migrations and type generation

3. **Authentication & Security**
   - JWT token-based auth
   - Password hashing with bcrypt
   - Protected routes and API procedures

4. **Third-Party Integrations**
   - Twilio WhatsApp API
   - Environment variable management
   - Error handling for external services

5. **DevOps & Deployment**
   - Monorepo deployment strategies
   - Serverless functions (Vercel)
   - Background job processing (Railway)

---

## 🗓️ Development Timeline

**Day 1:** ✅ Project setup, monorepo structure, dependencies
**Day 2:** ✅ Backend (tRPC routers, auth, CRUD)
**Day 3:** ✅ Frontend (auth UI, dashboard, forms)
**Day 4:** ✅ WhatsApp integration, background worker
**Day 5:** ✅ Local testing, UX improvements (quick presets)
**Day 6-7:** ✅ Deployment attempts, technical documentation, honest assessment

**Key Achievements:**
- Built production-ready full-stack app locally
- Implemented complete auth flow with JWT & bcrypt
- Integrated Twilio WhatsApp API successfully
- Created background job processor with cron
- Documented deployment challenges and alternative solutions
- Learned serverless platform constraints in-depth

---

## 🎓 What I'm Learning

This migration demonstrates:
- **Framework-agnostic architecture** - 70% of codebase works in both SolidJS and React
- **Type-safe full-stack development** - tRPC + Prisma + Zod end-to-end types
- **Modern React patterns** - Server Components, App Router, hooks, TanStack ecosystem
- **Reactivity concepts** - SolidJS signals → React hooks comparison (see [learnings doc](docs/learnings/migration-learnings.md#solidjs-signals-vs-react-hooks))
- **Migration expertise** - Systematic approach to framework transitions
- **Product thinking** - Legal, security, and scalability considerations for real-world apps

**Detailed technical learnings:** See [docs/learnings/migration-learnings.md](docs/learnings/migration-learnings.md)
**Migration decisions:** See [docs/migration-journal.md](docs/migration-journal.md)
**SolidJS deep dive:** See [docs/reference/technical-deep-dive.md](docs/reference/technical-deep-dive.md)

---

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Rafael Murad**

- LinkedIn: [rflmurad](https://www.linkedin.com/in/rflmurad/)
- Email: rflmurad@gmail.com
- Portfolio: [Your Portfolio URL]

---

## 🙏 Acknowledgments

- **[tRPC Team](https://trpc.io/)** - For revolutionizing API development
- **[SolidJS Team](https://www.solidjs.com/)** - For a fantastic reactive framework
- **[Theo Browne](https://www.youtube.com/@t3dotgg)** - Inspiration for modern web dev patterns

---

**⭐ If you find this project helpful, please consider giving it a star!**
