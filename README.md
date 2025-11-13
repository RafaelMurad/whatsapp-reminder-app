# 📱 WhatsApp Reminder App

> A full-stack TypeScript reminder application with WhatsApp notifications - demonstrating modern web development practices and end-to-end type safety.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![SolidJS](https://img.shields.io/badge/SolidJS-1.8-2c4f7c?logo=solid)](https://www.solidjs.com/)
[![tRPC](https://img.shields.io/badge/tRPC-10.45-398ccb)](https://trpc.io/)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.44-C5F74F)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start (3 commands)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd whatsapp-reminder-app
pnpm install

# 2. Setup database and env
pnpm db:push

# 3. Start development
pnpm dev
```

**That's it!** App runs at `http://localhost:3000`

> **First time?** If you don't have `.env`, copy `.env.example` to `.env` first.
> **OR** run the automated setup: `./setup.sh`

---

## 🎯 Project Overview

A portfolio project built to showcase full-stack TypeScript development, focusing on:
- **End-to-end type safety** with tRPC
- **Modern frontend** with SolidJS and SolidStart
- **Professional architecture** using monorepo patterns
- **Real-world integration** with Twilio WhatsApp API
- **Production deployment** on Vercel + Railway

**Timeline:** 7-day MVP sprint (Nov 11-18, 2025)  
**Status:** ✅ Ready for Production Deployment

**Live Demo:** Coming soon (deploy to Vercel)

---

## ✨ Features

### Backend (✅ Complete)
- [x] Monorepo setup with pnpm workspaces
- [x] Type-safe database with Drizzle ORM
- [x] tRPC API with full type safety
- [x] JWT authentication with bcrypt
- [x] User registration and login endpoints
- [x] Full CRUD operations for reminders
- [x] Protected routes with auth middleware

### Frontend (🚧 In Progress)
- [ ] Authentication UI (login/register pages)
- [ ] Dashboard with reminder list
- [ ] Create/edit reminder forms
- [ ] WhatsApp number verification
- [ ] Responsive design

### Deployment (📋 Planned)
- [ ] WhatsApp notifications via Twilio
- [ ] Background job scheduler
- [ ] Production deployment on Vercel
- [ ] Database deployment on Turso

### Future Enhancements
- AI-generated reminder messages (OpenAI)
- Location-based reminders
- Recurring reminders
- Multi-channel notifications (Email, SMS)
- Shared reminders for teams

---

## 🛠️ Tech Stack

### Frontend
- **[SolidJS](https://www.solidjs.com/)** - Reactive UI library (like React, but faster)
- **[SolidStart](https://start.solidjs.com/)** - Full-stack meta-framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling

### Backend
- **[tRPC](https://trpc.io/)** - End-to-end type-safe APIs (no code generation!)
- **[Drizzle ORM](https://orm.drizzle.team/)** - Lightweight, type-safe ORM
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
- **[Vercel](https://vercel.com/)** - Frontend + serverless API
- **[Railway](https://railway.app/)** - Background job workers

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
**Day 2:** Backend (tRPC routers, auth, CRUD)  
**Day 3:** Frontend (auth UI, dashboard)  
**Day 4:** WhatsApp integration  
**Day 5:** Background jobs, testing  
**Day 6-7:** Deployment, polish, documentation

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
