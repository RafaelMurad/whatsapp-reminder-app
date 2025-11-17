# Guided Learning Path - WhatsApp Reminder App

## How to Use This Guide

**Step 1: Answer Basic Questions**
- For each technology section, answer all "Basic Questions" by checking the docs
- Write your answers in a notebook or document
- Check the box when you've answered all questions in that section

**Step 2: Request Deep Dive**
- Once you've completed Basic Questions for a section, tell me: "Ready for deep dive on [Technology]"
- I'll explain how it works under the hood
- I'll show you how to achieve the same result with different technologies
- I'll give you rich perspective and real-world examples

**Step 3: Move to Next Section**
- Complete all technologies in order
- Build depth, not breadth

---

## Progress Tracker

### Core Frontend Concepts
- [ ] **Section 1: SolidJS Reactivity** (Basic Questions Completed)
- [ ] **Section 1: SolidJS Reactivity** (Deep Dive Completed)
- [ ] **Section 2: React Hooks & Virtual DOM** (Basic Questions Completed)
- [ ] **Section 2: React Hooks & Virtual DOM** (Deep Dive Completed)
- [ ] **Section 3: Next.js App Router** (Basic Questions Completed)
- [ ] **Section 3: Next.js App Router** (Deep Dive Completed)
- [ ] **Section 4: Server Components** (Basic Questions Completed)
- [ ] **Section 4: Server Components** (Deep Dive Completed)

### Type Safety & APIs
- [ ] **Section 5: TypeScript Type Inference** (Basic Questions Completed)
- [ ] **Section 5: TypeScript Type Inference** (Deep Dive Completed)
- [ ] **Section 6: tRPC** (Basic Questions Completed)
- [ ] **Section 6: tRPC** (Deep Dive Completed)
- [ ] **Section 7: Zod Validation** (Basic Questions Completed)
- [ ] **Section 7: Zod Validation** (Deep Dive Completed)

### Database & ORM
- [ ] **Section 8: Prisma ORM** (Basic Questions Completed)
- [ ] **Section 8: Prisma ORM** (Deep Dive Completed)
- [ ] **Section 9: Drizzle ORM** (Basic Questions Completed)
- [ ] **Section 9: Drizzle ORM** (Deep Dive Completed)

### Authentication & Security
- [ ] **Section 10: JWT Tokens** (Basic Questions Completed)
- [ ] **Section 10: JWT Tokens** (Deep Dive Completed)
- [ ] **Section 11: Password Hashing (bcrypt)** (Basic Questions Completed)
- [ ] **Section 11: Password Hashing (bcrypt)** (Deep Dive Completed)

### Architecture
- [ ] **Section 12: Monorepo with pnpm** (Basic Questions Completed)
- [ ] **Section 12: Monorepo with pnpm** (Deep Dive Completed)
- [ ] **Section 13: API Design Patterns** (Basic Questions Completed)
- [ ] **Section 13: API Design Patterns** (Deep Dive Completed)

---

## Section 1: SolidJS Reactivity

### 📚 Required Reading
- [SolidJS Tutorial - Signals](https://www.solidjs.com/tutorial/introduction_signals)
- [SolidJS Tutorial - Effects](https://www.solidjs.com/tutorial/introduction_effects)
- [SolidJS Tutorial - Memos](https://www.solidjs.com/tutorial/introduction_memos)

### ❓ Basic Questions (Answer these FIRST)

**Q1.1:** What is a signal in SolidJS? What does `createSignal()` return?

**Q1.2:** How do you read a signal's value? How do you set a signal's value?

**Q1.3:** What is `createEffect()`? When does the function inside it run?

**Q1.4:** What is `createMemo()`? How is it different from `createEffect()`?

**Q1.5:** In this code, why do you need parentheses after `count`?
```javascript
const [count, setCount] = createSignal(0)
return <div>{count()}</div>
```

**Q1.6:** Does the component function re-run when a signal changes? Why or why not?

**Q1.7:** What is "fine-grained reactivity"?

**Q1.8:** Look at the SolidJS documentation: What is the difference between `createSignal` and `createStore`?

### ✅ Completion Checklist
- [ ] I've answered all 8 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on SolidJS Reactivity"

---

## Section 2: React Hooks & Virtual DOM

### 📚 Required Reading
- [React Docs - State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [React Docs - Render and Commit](https://react.dev/learn/render-and-commit)
- [React Docs - useEffect](https://react.dev/reference/react/useEffect)
- [React Docs - useMemo](https://react.dev/reference/react/useMemo)

### ❓ Basic Questions (Answer these FIRST)

**Q2.1:** What does `useState(0)` return? How is it different from `createSignal(0)`?

**Q2.2:** When a component's state changes, what happens to the component function?

**Q2.3:** What is the virtual DOM? Why does React use it?

**Q2.4:** What is "reconciliation" in React?

**Q2.5:** In this code, when does the effect run?
```javascript
const [count, setCount] = useState(0)
useEffect(() => {
  console.log('Effect ran')
}, [count])
```

**Q2.6:** What happens if you forget the dependency array `[count]` in useEffect?

**Q2.7:** What is `useMemo()` used for? When should you use it?

**Q2.8:** What is the difference between `useMemo` and `useCallback`?

**Q2.9:** Look at the React docs: What are the three phases of a component's lifecycle?

**Q2.10:** What is "tearing" in React, and how do Concurrent Features prevent it?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on React Hooks & Virtual DOM"

---

## Section 3: Next.js App Router

### 📚 Required Reading
- [Next.js Docs - App Router](https://nextjs.org/docs/app)
- [Next.js Docs - Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Docs - Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [Next.js Docs - Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

### ❓ Basic Questions (Answer these FIRST)

**Q3.1:** What is the App Router? How is it different from the Pages Router?

**Q3.2:** How do you create a route in the App Router? What file names are special?

**Q3.3:** What is a layout? How does it differ from a page?

**Q3.4:** What are route groups in Next.js? How do you create one?

**Q3.5:** In this file structure, what URLs exist?
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
└── (protected)/
    └── dashboard/
        └── page.tsx
```

**Q3.6:** What is `loading.tsx`? When does it show?

**Q3.7:** What is `error.tsx`? How does it work?

**Q3.8:** Look at the docs: What is parallel routing? What is an intercepting route?

### ✅ Completion Checklist
- [ ] I've answered all 8 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on Next.js App Router"

---

## Section 4: Server Components

### 📚 Required Reading
- [Next.js Docs - Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Docs - Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Docs - Server Components](https://react.dev/reference/rsc/server-components)

### ❓ Basic Questions (Answer these FIRST)

**Q4.1:** What is a Server Component? Where does it run?

**Q4.2:** What is a Client Component? How do you mark a component as a Client Component?

**Q4.3:** Can Server Components use hooks like `useState` or `useEffect`? Why or why not?

**Q4.4:** Can a Server Component import a Client Component? Can a Client Component import a Server Component?

**Q4.5:** In this code, where does the fetch happen?
```typescript
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}
```

**Q4.6:** What is sent to the browser when a Server Component renders?

**Q4.7:** Can you call a database directly in a Server Component? Should you?

**Q4.8:** What is the "use client" directive? Where do you put it?

**Q4.9:** Look at the docs: What is the difference between Static Rendering and Dynamic Rendering?

**Q4.10:** What is Streaming in Next.js? How does it relate to Suspense?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on Server Components"

---

## Section 5: TypeScript Type Inference

### 📚 Required Reading
- [TypeScript Handbook - Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook - Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html)

### ❓ Basic Questions (Answer these FIRST)

**Q5.1:** What is type inference? Give an example where TypeScript infers a type.

**Q5.2:** What does the `typeof` type operator do? How is it different from JavaScript's `typeof`?

**Q5.3:** What is a generic type? What does `<T>` mean in function declarations?

**Q5.4:** In this code, what is the inferred return type?
```typescript
function getUser() {
  return { id: 1, name: 'Alice' }
}
```

**Q5.5:** What is `ReturnType<typeof functionName>`? What does it give you?

**Q5.6:** What is the difference between `interface` and `type` in TypeScript?

**Q5.7:** What is structural typing? How is it different from nominal typing?

**Q5.8:** In this code, what is `T` inferred as?
```typescript
function identity<T>(value: T): T {
  return value
}
const result = identity('hello')
```

**Q5.9:** Look at the docs: What is `keyof`? What does it return?

**Q5.10:** What is a type predicate? What does `is` do in a return type?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on TypeScript Type Inference"

---

## Section 6: tRPC

### 📚 Required Reading
- [tRPC Docs - Quickstart](https://trpc.io/docs/quickstart)
- [tRPC Docs - Procedures](https://trpc.io/docs/server/procedures)
- [tRPC Docs - Routers](https://trpc.io/docs/server/routers)
- [tRPC Docs - Context](https://trpc.io/docs/server/context)

### ❓ Basic Questions (Answer these FIRST)

**Q6.1:** What problem does tRPC solve?

**Q6.2:** What is a "procedure" in tRPC?

**Q6.3:** What is the difference between a "query" and a "mutation"?

**Q6.4:** What does `.input()` do in a tRPC procedure? What library does it typically use?

**Q6.5:** What is the tRPC "context"? When is it created?

**Q6.6:** How does tRPC provide type safety without code generation?

**Q6.7:** What is `AppRouter` type? How does the client use it?

**Q6.8:** In this code, how does the client know what input to pass?
```typescript
// Backend
export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => { /* ... */ })
})

// Frontend
const user = trpc.user.getById.useQuery({ id: '123' })
```

**Q6.9:** Look at the docs: What is middleware in tRPC? Give an example use case.

**Q6.10:** What is the difference between `publicProcedure` and `protectedProcedure`?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on tRPC"

---

## Section 7: Zod Validation

### 📚 Required Reading
- [Zod Docs - Introduction](https://zod.dev/)
- [Zod Docs - Primitives](https://zod.dev/?id=primitives)
- [Zod Docs - Objects](https://zod.dev/?id=objects)
- [Zod Docs - Type Inference](https://zod.dev/?id=type-inference)

### ❓ Basic Questions (Answer these FIRST)

**Q7.1:** What is Zod? What problem does it solve?

**Q7.2:** What is the difference between runtime validation and compile-time type checking?

**Q7.3:** What does `z.string()` create?

**Q7.4:** How do you make a field optional in Zod?

**Q7.5:** What does `.parse()` do? What does it return?

**Q7.6:** What is the difference between `.parse()` and `.safeParse()`?

**Q7.7:** How do you infer a TypeScript type from a Zod schema?
```typescript
const userSchema = z.object({
  id: z.string(),
  email: z.email()
})
// How do you get the User type?
```

**Q7.8:** How do you add custom error messages in Zod?

**Q7.9:** Look at the docs: What is `.transform()` in Zod? When would you use it?

**Q7.10:** How does Zod integrate with tRPC?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on Zod Validation"

---

## Section 8: Prisma ORM

### 📚 Required Reading
- [Prisma Docs - Data Model](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)
- [Prisma Docs - Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Prisma Docs - Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Prisma Docs - Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### ❓ Basic Questions (Answer these FIRST)

**Q8.1:** What is an ORM? What problem does it solve?

**Q8.2:** What is the Prisma Schema? What file extension does it use?

**Q8.3:** How do you define a relation between two models in Prisma?

**Q8.4:** What is `@id` in Prisma? What is `@default(cuid())`?

**Q8.5:** What is a migration in Prisma? How do you create one?

**Q8.6:** What is Prisma Client? How is it generated?

**Q8.7:** In this schema, what is the relationship?
```prisma
model User {
  id        String     @id @default(cuid())
  reminders Reminder[]
}

model Reminder {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

**Q8.8:** How do you query a user with all their reminders using Prisma Client?

**Q8.9:** Look at the docs: What is Prisma Studio? What does it do?

**Q8.10:** What is the difference between `prisma migrate dev` and `prisma db push`?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on Prisma ORM"

---

## Section 9: Drizzle ORM

### 📚 Required Reading
- [Drizzle Docs - Overview](https://orm.drizzle.team/docs/overview)
- [Drizzle Docs - SQL Schema Declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [Drizzle Docs - Queries](https://orm.drizzle.team/docs/select)

### ❓ Basic Questions (Answer these FIRST)

**Q9.1:** How is Drizzle different from Prisma in terms of schema definition?

**Q9.2:** What does `sqliteTable()` do in Drizzle?

**Q9.3:** How do you define a relation in Drizzle?

**Q9.4:** What is the Drizzle query syntax? How is it different from Prisma?

**Q9.5:** In Drizzle, how do you select all users?
```typescript
// Using the db object and users table
```

**Q9.6:** What is `eq()` in Drizzle? What does it do?

**Q9.7:** Does Drizzle generate code like Prisma? Why or why not?

**Q9.8:** How do you create a migration in Drizzle?

**Q9.9:** Look at the docs: What is `drizzle-kit`? What is it used for?

**Q9.10:** Compare Drizzle and Prisma: What are 3 key differences?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on Drizzle ORM"

---

## Section 10: JWT Tokens

### 📚 Required Reading
- [JWT.io - Introduction](https://jwt.io/introduction)
- [RFC 7519 - JSON Web Token (skim sections 1-4)](https://datatracker.ietf.org/doc/html/rfc7519)

### ❓ Basic Questions (Answer these FIRST)

**Q10.1:** What does JWT stand for?

**Q10.2:** What are the three parts of a JWT? What separates them?

**Q10.3:** What is the header of a JWT? What information does it contain?

**Q10.4:** What is the payload of a JWT? What kind of data goes there?

**Q10.5:** What is the signature of a JWT? How is it created?

**Q10.6:** Can you read a JWT's payload without the secret? Why is this important?

**Q10.7:** How does the signature prevent tampering?

**Q10.8:** What is the `exp` claim? What happens when it expires?

**Q10.9:** Look up: What is the difference between `jwt.sign()` and `jwt.verify()` in the jsonwebtoken library?

**Q10.10:** What is the difference between symmetric and asymmetric JWT signing?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on JWT Tokens"

---

## Section 11: Password Hashing (bcrypt)

### 📚 Required Reading
- [OWASP - Password Storage Cheat Sheet](https://cheatsheetsecurity.com/html/cheatsheet/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [bcrypt npm package docs](https://www.npmjs.com/package/bcrypt)

### ❓ Basic Questions (Answer these FIRST)

**Q11.1:** Why should you never store passwords in plain text?

**Q11.2:** What is a cryptographic hash? What properties make it secure?

**Q11.3:** What is a "salt" in password hashing? Why is it important?

**Q11.4:** What is bcrypt? How is it different from simple hash functions like MD5 or SHA-256?

**Q11.5:** What are "salt rounds" in bcrypt? What does the number mean?

**Q11.6:** In this code, what does the `10` mean?
```javascript
const hash = await bcrypt.hash(password, 10)
```

**Q11.7:** How do you verify a password against a hash in bcrypt?

**Q11.8:** Why is bcrypt slow? Is that a bug or a feature?

**Q11.9:** Look up: What is "work factor" or "cost factor" in bcrypt?

**Q11.10:** What is Argon2? How does it compare to bcrypt?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on Password Hashing"

---

## Section 12: Monorepo with pnpm

### 📚 Required Reading
- [pnpm Docs - Workspaces](https://pnpm.io/workspaces)
- [pnpm Docs - Workspace Protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [Monorepo.tools - What is a Monorepo](https://monorepo.tools/#what-is-a-monorepo)

### ❓ Basic Questions (Answer these FIRST)

**Q12.1:** What is a monorepo? How is it different from a monolith?

**Q12.2:** What is pnpm? How is it different from npm?

**Q12.3:** What is a workspace in pnpm?

**Q12.4:** What does `workspace:*` mean in package.json dependencies?

**Q12.5:** How do you reference one workspace package from another?

**Q12.6:** What is the benefit of sharing TypeScript types across packages in a monorepo?

**Q12.7:** In this structure, how does `apps/web` use code from `packages/api`?
```
monorepo/
├── apps/
│   └── web/
└── packages/
    └── api/
```

**Q12.8:** What is hoisting in package managers? How does pnpm handle it?

**Q12.9:** Look at the docs: What is Turborepo? How does it help with monorepos?

**Q12.10:** What are the trade-offs of monorepo vs polyrepo (multiple repositories)?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on Monorepo with pnpm"

---

## Section 13: API Design Patterns

### 📚 Required Reading
- [RESTful API Design - Best Practices](https://restfulapi.net/)
- [GraphQL Docs - Introduction](https://graphql.org/learn/)
- [Microsoft - API Design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

### ❓ Basic Questions (Answer these FIRST)

**Q13.1:** What does REST stand for? What are the core principles?

**Q13.2:** What are the standard HTTP methods (verbs) in REST? What does each one do?

**Q13.3:** What is a resource in REST? Give an example URL structure.

**Q13.4:** What is RPC (Remote Procedure Call)? How is it different from REST?

**Q13.5:** What is GraphQL? What problem does it solve?

**Q13.6:** In GraphQL, what is a query? What is a mutation?

**Q13.7:** Design a REST API for getting a user's reminders:
- What would the URL be?
- What HTTP method?
- What status codes might it return?

**Q13.8:** Design the same API using tRPC (RPC style):
- What would the procedure name be?
- Would it be a query or mutation?

**Q13.9:** Look up: What is the "N+1 problem" in APIs? Which design pattern is most susceptible?

**Q13.10:** Compare REST, RPC (tRPC), and GraphQL:
- Which is best for public APIs?
- Which is best for mobile apps?
- Which is best for TypeScript monorepos?

### ✅ Completion Checklist
- [ ] I've answered all 10 questions above
- [ ] I've written my answers in my notes
- [ ] I'm ready for the deep dive

**When ready, tell me:** "Ready for deep dive on API Design Patterns"

---

## 🎓 Completion & Next Steps

Once you've completed all sections:
- [ ] All 13 sections completed (Basic Questions + Deep Dives)
- [ ] I can explain each technology to someone else
- [ ] I understand the trade-offs between alternative approaches
- [ ] I'm ready for technical interviews

**Final Challenge:**
Tell me: "I'm ready for the integration challenge"

I'll give you a complex scenario that requires understanding how multiple technologies work together.

---

## 📝 Notes Section

Use this space to write key insights as you learn:

### SolidJS Reactivity Insights
[Your notes here]

### React Hooks Insights
[Your notes here]

### Next.js App Router Insights
[Your notes here]

### Server Components Insights
[Your notes here]

### TypeScript Type Inference Insights
[Your notes here]

### tRPC Insights
[Your notes here]

### Zod Validation Insights
[Your notes here]

### Prisma ORM Insights
[Your notes here]

### Drizzle ORM Insights
[Your notes here]

### JWT Tokens Insights
[Your notes here]

### Password Hashing Insights
[Your notes here]

### Monorepo Insights
[Your notes here]

### API Design Patterns Insights
[Your notes here]

---

**Remember:**
- Don't rush through sections
- Write down your answers before asking for the deep dive
- Understanding "why" is more important than memorizing "what"
- Compare technologies to build perspective, not just knowledge

Good luck! 🚀
