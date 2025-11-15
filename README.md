# 📱 WhatsApp Reminder App

> A full-stack TypeScript reminder application with WhatsApp notifications - demonstrating modern web development practices and end-to-end type safety.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![SolidJS](https://img.shields.io/badge/SolidJS-1.8-2c4f7c?logo=solid)](https://www.solidjs.com/)
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

**Timeline:** 7-day MVP sprint (Nov 11-18, 2025)
**Status:** ✅ MVP Complete Locally | 📚 Deployment & Documentation Phase

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

## 🛠️ Tech Stack

### Frontend
- **[SolidJS](https://www.solidjs.com/)** - Reactive UI library (like React, but faster)
- **[SolidStart](https://start.solidjs.com/)** - Full-stack meta-framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling

### Backend
- **[tRPC](https://trpc.io/)** - End-to-end type-safe APIs (no code generation!)
- **[Prisma](https://www.prisma.io/)** - Type-safe ORM
- **[Zod](https://zod.dev/)** - Runtime validation & TypeScript types

### Infrastructure
- **[pnpm](https://pnpm.io/)** - Fast, efficient package manager
- **Monorepo** - Shared types across frontend/backend
- **SQLite** (dev) → **PostgreSQL** (production)

### Integrations
- **[Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)** - Message delivery
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Deployment
- **Local Development** - Fully functional with SQLite
- **Target Platforms** - Vercel (frontend) + Railway (worker)
- **Status** - Deployment challenges documented (see [Technical Deep Dive](docs/reference/technical-deep-dive.md))
- **Learnings** - Serverless constraints, Prisma bundling, platform-specific configs

---

## 📁 Project Structure

```
whatsapp-reminder-app/
├── apps/
│   └── web/                 # SolidStart frontend application
│       ├── src/
│       │   ├── routes/      # File-based routing (pages)
│       │   ├── components/  # Reusable UI components
│       │   └── lib/         # tRPC client, utilities
│       └── package.json
├── packages/
│   ├── db/                  # Database layer (Prisma)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── api/                 # Backend logic (tRPC routers)
│       ├── src/
│       │   ├── routers/     # Auth, reminders, etc.
│       │   ├── services/    # WhatsApp, email, etc.
│       │   └── context.ts   # tRPC context (auth, db)
│       └── package.json
├── pnpm-workspace.yaml      # Monorepo configuration
└── package.json             # Root package scripts
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

## 🎓 What I Learned

This project was an intensive learning experience in modern full-stack development. Here are the key takeaways:

### Technical Mastery

**Type-Safe Development:**
- tRPC's end-to-end type safety eliminates entire classes of bugs
- Prisma's generated types provide compile-time database safety
- Zod bridges runtime validation with TypeScript types
- Monorepo enables sharing types across packages seamlessly

**Authentication & Security:**
- Implemented JWT-based stateless authentication
- bcrypt password hashing with appropriate cost factors
- Protected API routes with middleware patterns
- Token-based authorization headers

**Database Design:**
- Relational modeling with one-to-many relationships
- Index optimization for query performance
- Migration strategies for schema evolution
- Understanding ORM trade-offs (abstraction vs. performance)

**Background Processing:**
- Cron scheduling patterns and expressions
- Idempotent job processing
- Error isolation in batch operations
- Retry strategies for failed jobs

**Third-Party Integration:**
- Twilio WhatsApp API integration
- E.164 phone number format handling
- API error handling and logging
- Sandbox vs. production environments

### Deployment Realities

**Challenges Encountered:**
- Prisma binary bundling on serverless platforms
- SolidStart + Vercel configuration complexity
- Monorepo deployment path management
- Cron jobs vs. serverless function limitations

**Lessons Applied:**
- Read platform documentation thoroughly before choosing tech
- Understand trade-offs between cutting-edge and battle-tested
- Document failures as learning opportunities
- Know when to pivot vs. persist

### Professional Growth

**Problem-Solving:**
- Systematic debugging of complex deployment issues
- Reading error messages and tracing root causes
- Researching solutions across docs, GitHub issues, communities
- Knowing when to ask for help

**Technical Communication:**
- Documenting architecture decisions with rationale
- Writing clear commit messages following conventions
- Creating comprehensive technical documentation
- Honest assessment of challenges and solutions

**Time Management:**
- Breaking large projects into manageable tasks
- Prioritizing MVP features over nice-to-haves
- Recognizing when to stop fighting edge cases
- Balancing learning new tech with shipping features

### For Interviews

This project demonstrates:
- **Full-stack TypeScript proficiency** (tRPC, Prisma, SolidJS)
- **Modern architecture patterns** (monorepo, type safety, DRY)
- **Real-world integration skills** (Twilio WhatsApp API)
- **Authentication implementation** (JWT, bcrypt, protected routes)
- **Background job processing** (cron, async tasks, error handling)
- **Honest technical assessment** (documenting challenges, not hiding failures)
- **Continuous learning mindset** (new frameworks, deployment platforms)
- **Professional communication** (clear documentation, commit history)

**See [docs/reference/technical-deep-dive.md](docs/reference/technical-deep-dive.md) for in-depth explanations of every concept.**

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
