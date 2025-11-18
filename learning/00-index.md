# Learning Roadmap: WhatsApp Reminder App

**Branch:** `claude/premium-deployment-011CV33R8L7TXuEAfD8ZXKyo`  
**Last Updated:** November 18, 2025

This learning guide explains every technology, pattern, and design decision in this branch. Each document is focused on a single topic with practical examples from our codebase and comparisons to alternative approaches.

---

## 🎯 Learning Philosophy

1. **Concept First** - Understand the "why" before the "how"
2. **Real Examples** - Every concept tied to actual code in this project
3. **Comparative Learning** - See alternatives to understand trade-offs
4. **Official Sources Only** - All references link to official documentation
5. **Question-Driven** - Reflection questions to deepen understanding

---

## 📚 Core Learning Path

Follow these in order for the most coherent learning experience:

### 1. [Design System Fundamentals](./01-design-system-fundamentals.md)
**What you'll learn:**
- What design systems are and why they exist
- Atomic design methodology (atoms → molecules → organisms)
- Design tokens and their role in consistency
- Accessibility-first component design

**Tech in this project:** shadcn/ui + Radix UI  
**Alternatives covered:** Material-UI, Chakra UI, Ant Design, Headless UI

---

### 2. [Next.js 15 + React 19 Architecture](./02-nextjs-react-architecture.md)
**What you'll learn:**
- App Router vs Pages Router
- React Server Components (RSC) vs Client Components
- Server Actions and form handling
- File-based routing and layouts
- Streaming and Suspense

**Tech in this project:** Next.js 15.0.3 + React 19.2.0  
**Alternatives covered:** Remix, SvelteKit, Nuxt, Astro

---

### 3. [shadcn/ui Component System](./03-shadcn-ui-system.md)
**What you'll learn:**
- Copy-paste philosophy vs npm packages
- Radix UI primitives and accessibility
- Customization through code ownership
- CLI-based component installation

**Tech in this project:** shadcn/ui + Radix UI  
**Alternatives covered:** Headless UI, Ariakit, React Aria, Reach UI

---

### 4. [Tailwind CSS + Theming](./04-tailwind-theming.md)
**What you'll learn:**
- Utility-first CSS philosophy
- CSS variables for dynamic theming
- Dark mode implementation
- Responsive design with mobile-first approach
- Custom design system in tailwind.config

**Tech in this project:** Tailwind CSS 3.4.1  
**Alternatives covered:** CSS Modules, Styled Components, Emotion, Vanilla Extract

---

### 5. [tRPC + React Query Data Flow](./05-trpc-react-query.md)
**What you'll learn:**
- End-to-end type safety without code generation
- React Query for server state management
- Optimistic updates and cache invalidation
- Monorepo API sharing across packages

**Tech in this project:** tRPC 11 + React Query 5  
**Alternatives covered:** GraphQL (Apollo/Relay), REST + Zod, SWR, RTK Query

---

### 6. [Authentication Patterns](./06-auth-patterns.md)
**What you'll learn:**
- Client-side vs server-side authentication
- JWT tokens and localStorage
- Protected routes with layouts
- Context API for auth state
- Security best practices

**Tech in this project:** Custom JWT auth + Context API  
**Alternatives covered:** NextAuth.js, Clerk, Supabase Auth, Auth0

---

### 7. [Monorepo with pnpm Workspaces](./07-monorepo-workspaces.md)
**What you'll learn:**
- Monorepo architecture benefits and challenges
- pnpm workspaces and package linking
- Shared packages and code reuse
- Deployment strategies for monorepos

**Tech in this project:** pnpm 9.15.0 workspaces  
**Alternatives covered:** npm workspaces, Yarn workspaces, Turborepo, Nx

---

## 🚀 How to Use This Guide

### For Complete Beginners
1. Start with **Design System Fundamentals** to understand the big picture
2. Move to **Next.js Architecture** to understand the framework
3. Work through the rest in order

### For Experienced Developers
1. Skim the index to find unfamiliar topics
2. Use the "Alternatives" sections for comparative learning
3. Jump directly to topics of interest

### For Interview Prep
1. Focus on the "Why We Use It" sections
2. Study the trade-offs in "Alternatives" sections
3. Use reflection questions to practice explaining concepts

---

## 🔗 Reference Documentation

**Existing Project Docs (Context):**
- [`/docs/PREMIUM_REDESIGN.md`](../docs/PREMIUM_REDESIGN.md) - Visual design specifications
- [`/docs/decisions/design-system-strategy.md`](../docs/decisions/design-system-strategy.md) - Component architecture
- [`/docs/decisions/tech-stack.md`](../docs/decisions/tech-stack.md) - Technology choices

**Official Documentation:**
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [tRPC](https://trpc.io/docs)
- [React Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [pnpm](https://pnpm.io/workspaces)

---

## 💡 Suggested Advanced Topics

Want to go deeper? Check [`/learning/suggestions/`](./suggestions/) for:
- Performance optimization strategies
- Testing patterns and best practices
- CI/CD and deployment automation
- Database design and Prisma ORM
- State management patterns
- Error handling and logging
- TypeScript advanced patterns

---

## 🤔 General Reflection Questions

Before starting, consider:
1. **What problem does this technology solve?** (Every tool exists to solve a specific pain point)
2. **What are the trade-offs?** (No solution is perfect; what do we gain and lose?)
3. **When would I NOT use this?** (Understanding limitations is as important as benefits)
4. **How does this fit in the bigger picture?** (How do pieces work together?)

---

## 📊 Progress Tracking

Mark topics as you complete them:
- [x] Design System Fundamentals ✅
- [x] Next.js + React Architecture ✅
- [x] shadcn/ui Component System ✅
- [x] Tailwind CSS + Theming ✅
- [x] tRPC + React Query ✅
- [x] Authentication Patterns ✅
- [x] Monorepo & Workspaces ✅

**🎉 All core topics complete!** Check out [`/learning/suggestions/`](./suggestions/) for advanced topics.
- [ ] Monorepo Workspaces

---

**Ready to start learning?** → [01. Design System Fundamentals](./01-design-system-fundamentals.md)
