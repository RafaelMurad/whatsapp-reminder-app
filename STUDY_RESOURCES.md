# Study Resources - Deep Dive into Technologies

## Purpose
Curated resources to deeply understand each technology in this project. Focus on concepts, not just API memorization.

---

## 🎯 Priority 1: Must Understand

### SolidJS & Reactivity
**Core Concept:** Fine-grained reactivity vs Virtual DOM

**Essential Reading:**
1. [SolidJS Docs - Reactivity](https://www.solidjs.com/tutorial/introduction_signals) - Interactive tutorial
2. [Ryan Carniato - How SolidJS Works](https://www.youtube.com/watch?v=hw3Bx5vxKl0) - Creator explains internals
3. [SolidJS vs React Performance](https://levelup.gitconnected.com/solid-js-vs-react-the-complete-comparison-db2b8f4d892f)

**Hands-on Exercise:**
```javascript
// Build this without tutorials - test your understanding
// 1. Create a signal for username
// 2. Create a computed value that shows "Hello, {username}"
// 3. Create an effect that logs when username changes
// 4. Explain why this doesn't need a dependency array
```

**Key Questions to Answer:**
- What is a signal?
- How does SolidJS track dependencies automatically?
- Why doesn't the component re-render?
- What compiles the JSX into?

---

### React Hooks & Reconciliation
**Core Concept:** Virtual DOM diffing and reconciliation

**Essential Reading:**
1. [React Docs - Describing the UI](https://react.dev/learn/describing-the-ui)
2. [React Reconciliation](https://react.dev/learn/preserving-and-resetting-state)
3. [Dan Abramov - React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/)

**Hands-on Exercise:**
```javascript
// Answer these without looking up:
// 1. Why does this component log twice?
function Counter() {
  const [count, setCount] = useState(0)
  console.log('render')
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// 2. What's the difference?
<Counter key="a" /> // vs
<Counter key={Math.random()} />

// 3. When should you use useMemo?
```

**Key Questions to Answer:**
- What is the virtual DOM?
- What is reconciliation?
- When does a component re-render?
- What are render phases (render vs commit)?

---

### Next.js App Router & Server Components
**Core Concept:** Server vs Client rendering

**Essential Reading:**
1. [Next.js Docs - App Router](https://nextjs.org/docs/app)
2. [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
3. [Theo Browne - Server Components Are NOT What You Think](https://www.youtube.com/watch?v=VIwWgV3Lc6s)

**Hands-on Exercise:**
```typescript
// Explain what happens in each case:

// Case 1: Server Component
export default async function Page() {
  const data = await fetch('...') // When does this run?
  return <div>{data}</div>
}

// Case 2: Client Component
'use client'
export default function Page() {
  const [data, setData] = useState()
  useEffect(() => { fetch('...') }) // When does this run?
  return <div>{data}</div>
}

// Case 3: Hybrid
export default async function Page() {
  const data = await fetch('...')
  return <ClientComponent data={data} />
}
```

**Key Questions to Answer:**
- Where does Server Component code execute?
- Can Server Components use hooks?
- How do you pass data from Server to Client components?
- What's the JavaScript bundle difference?

---

### tRPC Type Safety
**Core Concept:** End-to-end type inference without codegen

**Essential Reading:**
1. [tRPC Docs - Quickstart](https://trpc.io/docs/quickstart)
2. [tRPC Docs - Procedures](https://trpc.io/docs/server/procedures)
3. [Theo Browne - tRPC Makes TypeScript Amazing](https://www.youtube.com/watch?v=2LYM8gf184U)

**Hands-on Exercise:**
```typescript
// Build a mini tRPC setup from scratch (30 min exercise):
// 1. Define a router with one query and one mutation
// 2. Add input validation with Zod
// 3. Create a type-safe client
// 4. Verify autocomplete works
// 5. Break a type and see the error
```

**Key Questions to Answer:**
- How does tRPC send types to the client without runtime code?
- What is `AppRouter` type?
- How do procedures differ from routes?
- When would you NOT use tRPC?

---

## 🎯 Priority 2: Important Context

### Prisma ORM
**Essential Reading:**
1. [Prisma Docs - Data Model](https://www.prisma.io/docs/concepts/components/prisma-schema)
2. [Prisma Docs - Client API](https://www.prisma.io/docs/concepts/components/prisma-client)
3. [How Prisma Works Under the Hood](https://www.prisma.io/docs/concepts/components/prisma-engines)

**Hands-on Exercise:**
```prisma
// Design a schema for:
// - Blog posts with authors
// - Comments on posts
// - Tags on posts (many-to-many)
// Include proper relations and indexes
```

**Key Questions:**
- What's a migration?
- What's Prisma Client?
- What are the Prisma engines?
- How does Prisma prevent SQL injection?

---

### JWT Authentication
**Essential Reading:**
1. [jwt.io Introduction](https://jwt.io/introduction)
2. [Auth0 - ID Token vs Access Token](https://auth0.com/blog/id-token-access-token-what-is-the-difference/)
3. [The JWT Handbook (free ebook)](https://auth0.com/resources/ebooks/jwt-handbook)

**Hands-on Exercise:**
```javascript
// Build a mini JWT auth system:
// 1. Sign a JWT with a secret
// 2. Decode it (without verifying) - see the payload
// 3. Verify it with the secret
// 4. Try verifying with wrong secret - handle error
// 5. Create an expired token - verify it fails
```

**Key Questions:**
- What are the three parts of a JWT?
- Why is the payload readable without the secret?
- What prevents tampering?
- JWT vs session cookies - trade-offs?

---

### Monorepo & pnpm
**Essential Reading:**
1. [pnpm Workspaces](https://pnpm.io/workspaces)
2. [Monorepo Tools](https://monorepo.tools/)
3. [Vercel - How Turborepo Works](https://turbo.build/repo/docs/core-concepts/monorepos)

**Key Questions:**
- What is `workspace:*` protocol?
- How does pnpm handle dependencies differently than npm?
- What is hoisting?
- Monorepo vs monolith vs polyrepo?

---

## 🎯 Priority 3: Nice to Know

### Drizzle ORM
**Essential Reading:**
1. [Drizzle Docs](https://orm.drizzle.team/docs/overview)
2. [Prisma vs Drizzle Comparison](https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-drizzle)

### Tailwind CSS
**Essential Reading:**
1. [Tailwind Docs](https://tailwindcss.com/docs)
2. [Utility-First CSS](https://tailwindcss.com/docs/utility-first)

### Zod Validation
**Essential Reading:**
1. [Zod Docs](https://zod.dev/)
2. [Schema Validation with Zod](https://www.totaltypescript.com/tutorials/zod)

---

## 📚 Concept Deep Dives

### 1. Reactivity Models

**Goal:** Understand how different frameworks handle updates

**Study Task:**
Compare these three approaches to the same problem:

```javascript
// React - Virtual DOM reconciliation
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// SolidJS - Fine-grained signals
function Counter() {
  const [count, setCount] = createSignal(0)
  return <button onClick={() => setCount(count() + 1)}>{count()}</button>
}

// Svelte - Compile-time reactivity
<script>
  let count = 0
</script>
<button on:click={() => count++}>{count}</button>
```

**Questions to Answer:**
- How does each framework detect that `count` changed?
- What updates in each case (component, DOM node, compiled code)?
- Which is fastest? Why?
- Which has the best DX? Why?

---

### 2. Type Systems

**Goal:** Understand nominal vs structural typing

**Study Task:**
```typescript
// TypeScript uses structural typing
interface User { id: string; name: string }
interface Product { id: string; name: string }

const user: User = { id: '1', name: 'Alice' }
const product: Product = user // ✅ This works! Why?

// How would you prevent this?
// Hint: Branded types
```

**Research:**
- What is structural typing?
- How is it different from nominal typing (like Java, C#)?
- What are branded types?
- When does this matter in tRPC?

---

### 3. Server-Side Rendering (SSR)

**Goal:** Understand SSR vs CSR vs SSG

**Study Task:**
Build a mental model:

1. **CSR (Client-Side Rendering):**
   - Server sends empty HTML + JavaScript bundle
   - JavaScript runs in browser, fetches data, renders UI
   - Example: Create React App

2. **SSR (Server-Side Rendering):**
   - Server fetches data, renders HTML, sends to client
   - Browser shows HTML immediately (First Contentful Paint)
   - JavaScript hydrates (makes interactive)
   - Example: Next.js pages

3. **SSG (Static Site Generation):**
   - HTML rendered at build time
   - Served as static files (fast!)
   - Data can be stale
   - Example: Gatsby, Next.js `getStaticProps`

**Draw this flow:**
```
User Request → Server → Response → Browser

For each approach above, what happens at each step?
```

---

### 4. API Design Patterns

**Goal:** Understand REST vs RPC vs GraphQL

**Study Task:**
Design the same API three ways:

**Requirement:** Get a user's reminders for a specific date

```typescript
// REST
GET /users/:userId/reminders?date=2025-11-20

// RPC (tRPC style)
trpc.reminder.getByDate.query({ userId, date })

// GraphQL
query {
  user(id: "123") {
    reminders(date: "2025-11-20") {
      id
      title
      message
    }
  }
}
```

**Questions:**
- Which is most flexible?
- Which is most type-safe?
- Which is easiest to cache?
- Which is best for mobile apps?

---

## 🧪 Practice Exercises

### Exercise 1: Build a Mini SolidJS App (30 min)
**Goal:** Internalize signals and effects

```javascript
// Build a todo app with:
// - Signal for todo list
// - Computed signal for completed count
// - Effect that logs when count changes
// - Explain why it's faster than React equivalent
```

### Exercise 2: Explain tRPC to a Beginner (5 min)
**Goal:** Test understanding through teaching

Record yourself explaining:
1. What problem does tRPC solve?
2. How does it work?
3. Show a code example
4. When would you NOT use it?

### Exercise 3: Compare ORMs (20 min)
**Goal:** Understand trade-offs

Write the same query in:
- Raw SQL
- Prisma
- Drizzle

Compare:
- Type safety
- Readability
- Performance
- Bundle size

### Exercise 4: Sketch Architecture (15 min)
**Goal:** Visualize system design

Draw your app's architecture:
- Frontend (browser)
- Backend (server)
- Database
- External APIs (Twilio)

Label:
- What runs where
- What data flows between components
- What types are shared

---

## 📖 Recommended Learning Path

### Week 1: Foundations
**Monday:** SolidJS reactivity (signals, effects, memos)
**Tuesday:** React hooks (useState, useEffect, useMemo)
**Wednesday:** Compare SolidJS vs React (write notes)
**Thursday:** Next.js App Router (routing, layouts)
**Friday:** Server Components vs Client Components

### Week 2: Type Safety
**Monday:** TypeScript fundamentals (generics, inference)
**Tuesday:** tRPC concepts (routers, procedures)
**Wednesday:** Zod validation (schemas, inference)
**Thursday:** Build mini tRPC app
**Friday:** Prisma ORM (schema, client, migrations)

### Week 3: Full Stack
**Monday:** JWT authentication (sign, verify)
**Tuesday:** bcrypt password hashing
**Wednesday:** Monorepo architecture (workspaces)
**Thursday:** API design patterns (REST vs RPC)
**Friday:** Practice interview questions

---

## 🎤 Interview Simulation

### Practice Questions (Answer Out Loud)

**Easy:**
1. What is a signal in SolidJS?
2. What is the difference between SSR and CSR?
3. Why use TypeScript?

**Medium:**
4. Explain how tRPC provides type safety without code generation
5. What are the trade-offs between JWT and session cookies?
6. Why did you migrate from SolidJS to React?

**Hard:**
7. How would you scale the background worker to 10,000 users?
8. Compare virtual DOM reconciliation to fine-grained reactivity
9. Design the authentication flow for a mobile app using your API

---

## 🔗 Additional Resources

### Video Courses
- [Total TypeScript (Matt Pocock)](https://www.totaltypescript.com/) - Free TypeScript course
- [Epic React (Kent C. Dodds)](https://epicreact.dev/) - Deep React course (paid)
- [Joy of React (Josh Comeau)](https://www.joyofreact.com/) - Mental models (paid)

### YouTube Channels
- [Theo Browne (t3.gg)](https://www.youtube.com/@t3dotgg) - Modern web dev, tRPC
- [Web Dev Simplified](https://www.youtube.com/@WebDevSimplified) - Clear explanations
- [Fireship](https://www.youtube.com/@Fireship) - Quick overviews

### Articles
- [Overreacted (Dan Abramov)](https://overreacted.io/) - React internals
- [Kent C. Dodds Blog](https://kentcdodds.com/blog) - React patterns
- [Josh Comeau Blog](https://www.joshwcomeau.com/) - CSS, React

### Documentation (Always Read Official Docs)
- [React Beta Docs](https://react.dev/) - New mental models
- [Next.js Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

## ✅ Readiness Checklist

Before your next interview, can you:

**Concepts:**
- [ ] Explain signals vs virtual DOM in 2 minutes
- [ ] Draw how Server Components work
- [ ] Explain tRPC type inference without looking at code
- [ ] Describe JWT structure from memory

**Code:**
- [ ] Write a tRPC procedure from scratch
- [ ] Write a Prisma schema with relations
- [ ] Build a protected route in Next.js
- [ ] Explain your monorepo structure

**Trade-offs:**
- [ ] Compare Prisma vs Drizzle (3 pros/cons each)
- [ ] Compare REST vs tRPC vs GraphQL
- [ ] Explain SSR vs CSR vs SSG
- [ ] Justify SolidJS choice and migration

**Your Project:**
- [ ] Give 30-second elevator pitch
- [ ] Explain migration decision
- [ ] Discuss what you'd change
- [ ] Describe deployment plan

---

**Remember:** Interviewers value depth over breadth. It's better to deeply understand 3 technologies than superficially know 10.

Focus on concepts, not memorizing APIs. APIs change, concepts don't.
