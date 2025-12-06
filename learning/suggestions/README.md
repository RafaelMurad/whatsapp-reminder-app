# Advanced Learning Topics

Welcome to the advanced topics section! These documents dive deeper into specific areas that build on the core 7 topics.

---

## 📚 Available Topics

### 1. [Performance Optimization](./01-performance-optimization.md)
**Difficulty:** Advanced  
**Time to Read:** 40-50 minutes

Learn how to make your Next.js app blazing fast:
- React Server Components performance benefits
- Code splitting and lazy loading
- Image optimization with next/image
- Bundle analysis and tree shaking
- React Query caching strategies
- Lighthouse audits and Core Web Vitals
- **Compare:** Next.js vs Vite, React vs Solid.js, Client-side vs SSR

### 2. [Testing Strategies](./02-testing-strategies.md)
**Difficulty:** Intermediate  
**Time to Read:** 45-55 minutes

Build confidence with comprehensive testing:
- Unit tests (Vitest vs Jest)
- Component tests (Testing Library)
- E2E tests (Playwright vs Cypress)
- tRPC mocking and testing
- Test-driven development (TDD)
- Coverage reporting
- **Compare:** Vitest vs Jest, Playwright vs Cypress, Testing Library vs Enzyme

### 3. [CI/CD Pipelines](./03-cicd-pipelines.md)
**Difficulty:** Intermediate  
**Time to Read:** 35-45 minutes

Automate your deployment workflow:
- GitHub Actions for CI/CD
- Automated testing on PR
- Preview deployments (Vercel)
- Environment variables management
- Database migrations in CI
- Semantic versioning and changesets
- **Compare:** GitHub Actions vs CircleCI vs Jenkins, Vercel vs Netlify vs Railway

### 4. [Prisma Deep Dive](./04-prisma-deep-dive.md)
**Difficulty:** Advanced  
**Time to Read:** 50-60 minutes

Master database operations:
- Advanced Prisma queries (include, select, where)
- Transactions and isolation levels
- Database indexing for performance
- Migration strategies (dev vs production)
- Prisma Client extensions
- Raw SQL when needed
- **Compare:** Prisma vs Drizzle vs TypeORM vs Kysely

### 5. [State Management Patterns](./05-state-management.md)
**Difficulty:** Intermediate  
**Time to Read:** 40-50 minutes

Beyond useState and Context:
- Server state (React Query) vs Client state
- URL as state (searchParams)
- Zustand for global state
- Form state (React Hook Form)
- Optimistic updates patterns
- State machines (XState)
- **Compare:** Zustand vs Redux vs Jotai vs Recoil

### 6. [Error Handling & Logging](./06-error-handling.md)
**Difficulty:** Intermediate  
**Time to Read:** 30-40 minutes

Handle errors gracefully:
- Error boundaries (React)
- Error pages (Next.js)
- tRPC error handling
- Logging strategies (Winston, Pino)
- Error tracking (Sentry)
- User-friendly error messages
- **Compare:** Sentry vs LogRocket vs Rollbar, Winston vs Pino

### 7. [TypeScript Advanced Patterns](./07-typescript-patterns.md)
**Difficulty:** Advanced  
**Time to Read:** 50-60 minutes

Level up your TypeScript:
- Utility types (Pick, Omit, Partial, etc.)
- Generics and constraints
- Type inference tricks
- Discriminated unions
- Template literal types
- Type-safe API contracts
- **Compare:** TypeScript vs Flow vs JSDoc types

---

## 🎯 How to Use These Docs

**Prerequisites:** Complete all 7 core topics first

**Learning Path:**
1. Start with topics relevant to your current work
2. Performance → Everyone should read (impacts UX)
3. Testing → Read before building features
4. CI/CD → Read when ready to deploy
5. Others → As needed

**Format:**
Each doc follows the same structure as core topics:
- Real examples from this project
- Alternative technologies comparison
- Reflection questions with answers
- Official documentation links only

---

## 💡 Suggestions for More Topics?

These are advanced topics I think would benefit your learning. If you want to explore:
- **Security best practices** (XSS, CSRF, SQL injection)
- **Accessibility deep dive** (ARIA, screen readers, keyboard navigation)
- **WebSocket patterns** (real-time updates)
- **Caching strategies** (CDN, Redis, service workers)
- **Internationalization** (i18n, multi-language support)
- **Analytics integration** (PostHog, Plausible, Google Analytics)
- **Feature flags** (LaunchDarkly, Unleash)

Just ask!

---

**Back to:** [Main Learning Index →](../00-index.md)
