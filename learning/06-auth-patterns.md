# Authentication Patterns

**Prerequisites:** tRPC + React Query basics  
**Time to Read:** 35-45 minutes  
**Difficulty:** Intermediate

---

## 🎯 What You'll Learn

- JWT (JSON Web Tokens) authentication
- Password hashing with bcrypt
- Client-side auth state (Context API + localStorage)
- Protected routes pattern
- Security best practices
- When to use hosted auth (NextAuth, Clerk, etc.)

---

## 📖 What is Authentication?

### Simple Definition
**Authentication** = Proving you are who you claim to be  
**Authorization** = Determining what you're allowed to do

**Analogy:**
- **Authentication** = Showing ID at airport security (proving identity)
- **Authorization** = Boarding pass determines which plane you can board (permissions)

### Our Approach

We use **custom JWT authentication**:

1. User registers → Password hashed → User saved to database
2. User logs in → Password verified → JWT token generated
3. Client stores token → Sends with every API request
4. Server validates token → Extracts user ID → Grants access

---

## 🔐 Password Security (bcrypt)

### The Problem

**Never store plaintext passwords!**

```typescript
// ❌ NEVER DO THIS
await prisma.user.create({
  data: {
    email: "user@example.com",
    password: "myPassword123",  // DANGER! Database breach = all passwords exposed
  },
});
```

### The Solution: Hashing

**Location:** `packages/api/src/lib/auth.ts`

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;  // Cost factor (higher = slower but more secure)

// Registration: Hash password before saving
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Login: Compare plaintext with hash
export async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**How it works:**
```typescript
// Registration
const hash = await hashPassword("myPassword123");
// Result: "$2b$10$N9qo8uLO..."  (60 char random hash)

// Login (same password)
const valid = await verifyPassword("myPassword123", hash);
// Result: true

// Login (wrong password)
const valid = await verifyPassword("wrongPassword", hash);
// Result: false
```

**Key concepts:**
- **One-way function:** Can't reverse hash to get password
- **Salt:** Random data added to password (prevents rainbow table attacks)
- **Cost factor:** Higher = slower hashing = harder to brute force

### Registration Flow

**Location:** `packages/api/src/routers/auth.ts`

```typescript
register: publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),  // bcrypt max 72 bytes
    phoneNumber: z.string().min(6).max(20),
  }))
  .mutation(async ({ input }) => {
    // 1. Check if email already exists
    const existing = await prisma.user.findUnique({ 
      where: { email: input.email } 
    });
    if (existing) {
      throw new TRPCError({ 
        code: 'CONFLICT', 
        message: 'Email already in use' 
      });
    }

    // 2. Hash password
    const passwordHash = await hashPassword(input.password);

    // 3. Create user (store hash, not plaintext)
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: passwordHash,  // Hashed!
        phoneNumber: input.phoneNumber,
      },
      select: { 
        id: true, 
        email: true, 
        phoneNumber: true, 
        createdAt: true 
      },
    });

    // 4. Generate JWT token
    const token = signJwt(user.id);

    // 5. Return user + token (auto-login after registration)
    return { user, token };
  }),
```

### Login Flow

```typescript
login: publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
  }))
  .mutation(async ({ input }) => {
    // 1. Find user by email
    const user = await prisma.user.findUnique({ 
      where: { email: input.email } 
    });
    if (!user) {
      throw new TRPCError({ 
        code: 'UNAUTHORIZED', 
        message: 'Invalid credentials' 
      });
    }

    // 2. Verify password
    const valid = await verifyPassword(input.password, user.password);
    if (!valid) {
      throw new TRPCError({ 
        code: 'UNAUTHORIZED', 
        message: 'Invalid credentials' 
      });
    }

    // 3. Generate JWT token
    const token = signJwt(user.id);

    // 4. Return user + token
    return { user, token };
  }),
```

**Security notes:**
- Same error message for "user not found" and "wrong password" (prevents email enumeration)
- Password never logged (console.log only email/phoneNumber)
- bcrypt compare is slow (prevents timing attacks)

---

## 🎫 JWT Tokens

### What is a JWT?

**JWT (JSON Web Token)** = Signed data that proves user identity

**Structure:**
```
header.payload.signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTBzdHRldDAwMDAwa3kwZjFhNWZzcHgiLCJpYXQiOjE2OTU2MDAwMDAsImV4cCI6MTY5NjIwNDgwMH0.5J1t-P8QHQY9Zv3Xk2lE8W6R4qY9T7vL3nM1sD0wB4g
```

**Decoded:**
```json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload (our data)
{ 
  "userId": "cm0sttet00000ky0f1a5fspx",
  "iat": 1695600000,  // Issued at (timestamp)
  "exp": 1696204800   // Expires at (timestamp)
}

// Signature (proves authenticity)
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Our JWT Implementation

**Location:** `packages/api/src/lib/auth.ts`

```typescript
import jwt from 'jsonwebtoken';

const JWT_EXPIRY = '7d';  // Token valid for 7 days

// Sign JWT (create token)
export function signJwt(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  
  return jwt.sign(
    { userId },           // Payload (data)
    secret,               // Secret key
    { expiresIn: JWT_EXPIRY }  // Expiration
  );
}

// Verify JWT (validate token)
export function verifyJwt(token: string): { userId: string } | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');
  
  try {
    const payload = jwt.verify(token, secret) as { userId?: string };
    if (!payload.userId) return null;
    return { userId: payload.userId };
  } catch {
    return null;  // Expired or invalid token
  }
}

// Extract token from "Bearer <token>" header
export function extractBearer(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer') return null;
  return token || null;
}
```

**Why JWT?**
- ✅ **Stateless:** No database lookup to validate (fast!)
- ✅ **Self-contained:** Token includes user ID
- ✅ **Tamper-proof:** Signature prevents modification
- ✅ **Standard:** Works with any HTTP client

**Drawbacks:**
- ❌ **Can't revoke:** Valid until expiration (solved with refresh tokens)
- ❌ **Size:** Larger than session IDs
- ❌ **Secret exposure:** If JWT_SECRET leaks, all tokens compromised

---

## 🛡️ Server-Side Protection

### Context Creation

**Location:** `packages/api/src/context.ts`

```typescript
import { verifyJwt, extractBearer } from './lib/auth';
import { prisma } from '@repo/db';

export async function createContext({ req }: { req: Request }) {
  const authHeader = req.headers.get('Authorization');
  const token = extractBearer(authHeader);
  
  if (!token) {
    return { user: null };  // No token = unauthenticated
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return { user: null };  // Invalid token
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return { user };  // Authenticated user in context
}
```

### Protected Procedure

**Location:** `packages/api/src/trpc.ts`

```typescript
import { TRPCError } from '@trpc/server';

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,  // TypeScript now knows user exists!
    },
  });
});
```

### Usage in Routers

```typescript
// Anyone can call this
getAll: publicProcedure.query(async () => {
  return { reminders: await prisma.reminder.findMany() };
});

// Only authenticated users can call this
getAll: protectedProcedure.query(async ({ ctx }) => {
  // ctx.user is guaranteed to exist (TypeScript enforced)
  return { 
    reminders: await prisma.reminder.findMany({
      where: { userId: ctx.user.id },  // User's reminders only
    }),
  };
});
```

---

## 💻 Client-Side Auth State

### Context API + localStorage

**Location:** `apps/web/lib/auth-context.tsx`

```typescript
"use client";

import { createContext, useContext, useState } from "react";

interface User {
  id: string;
  email: string;
  phoneNumber: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }) {
  // Lazy initialization from localStorage
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;  // SSR safety
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token && !!user,
      isLoading: false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Key concepts:**
- **Context API:** Share auth state across components (no prop drilling)
- **localStorage:** Persist auth across page reloads
- **Lazy initialization:** Read from localStorage only once (performance)
- **SSR safety:** Check `typeof window` to avoid server errors

### Using in Components

```tsx
"use client";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: ({ user, token }) => {
      login(token, user);  // Save to context + localStorage
      router.push("/dashboard");
    },
  });

  async function handleSubmit(email: string, password: string) {
    await loginMutation.mutateAsync({ email, password });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🚪 Protected Routes

### Layout-Based Protection

**Location:** `apps/web/app/(protected)/layout.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");  // Redirect to login
    }
  }, [isAuthenticated, router]);

  // Don't render children until authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

**How it works:**
1. User navigates to `/dashboard` (inside `(protected)` folder)
2. Layout checks `isAuthenticated`
3. If false → Redirect to `/login`
4. If true → Render children

**File structure:**
```
app/
  (auth)/          # Public routes
    login/
      page.tsx
    register/
      page.tsx
  (protected)/     # Protected routes
    layout.tsx     # ← Auth guard here
    dashboard/
      page.tsx     # Automatically protected
    settings/
      page.tsx     # Automatically protected
```

### Sending Token with Requests

**Location:** `apps/web/lib/trpc.ts`

```typescript
export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        headers() {
          const token = localStorage.getItem("auth_token");
          return token ? { 
            Authorization: `Bearer ${token}` 
          } : {};
        },
      }),
    ],
  });
}
```

**Flow:**
1. Client calls `trpc.reminder.getAll.useQuery()`
2. tRPC reads token from localStorage
3. Adds `Authorization: Bearer <token>` header
4. Server validates token in `createContext()`
5. `protectedProcedure` ensures user exists
6. Query executes with user context

---

## 🌍 Our Tech vs Alternatives

### What We Use: Custom JWT Auth

**Philosophy:** Full control, minimal dependencies  
**Official Docs:** https://jwt.io

**Pros:**
- ✅ Full control over logic
- ✅ No vendor lock-in
- ✅ Learn auth internals
- ✅ Simple for MVP

**Cons:**
- ❌ Manual security (easy to mess up)
- ❌ No OAuth (Google, GitHub login)
- ❌ No session management
- ❌ Must implement refresh tokens yourself

**Best for:** Learning, MVPs, simple apps

### Alternative 1: NextAuth.js (Auth.js)

**Philosophy:** Auth for Next.js apps  
**Official Docs:** https://next-auth.js.org

**Pros:**
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ Session management
- ✅ Database adapters (Prisma, etc.)
- ✅ Built-in CSRF protection
- ✅ Well-tested security

**Cons:**
- ❌ Tight Next.js coupling
- ❌ Complex config for custom needs
- ❌ Learning curve

**Example:**
```tsx
import { signIn, signOut, useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  
  if (!session) return <button onClick={() => signIn()}>Login</button>;
  
  return <div>Welcome {session.user.email}</div>;
}
```

**When to use:** Need OAuth, enterprise security, production apps

### Alternative 2: Clerk

**Philosophy:** Hosted auth as a service  
**Official Docs:** https://clerk.com/docs

**Pros:**
- ✅ Drop-in UI components
- ✅ OAuth, passwordless, MFA
- ✅ User management dashboard
- ✅ Zero security maintenance
- ✅ Amazing DX

**Cons:**
- ❌ Vendor lock-in
- ❌ Costs money (free tier limited)
- ❌ Less customization

**Example:**
```tsx
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";

export default function LoginPage() {
  return <SignIn />;  // That's it!
}
```

**When to use:** Rapid prototyping, don't want to handle auth

### Alternative 3: Supabase Auth

**Philosophy:** Backend-as-a-service with built-in auth  
**Official Docs:** https://supabase.com/docs/guides/auth

**Pros:**
- ✅ OAuth providers
- ✅ Magic links (passwordless)
- ✅ Row-level security (database-level auth)
- ✅ Realtime subscriptions

**Cons:**
- ❌ Must use Supabase ecosystem
- ❌ Migration complexity if you leave

**Example:**
```tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(URL, KEY);

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

**When to use:** Using Supabase for database, want integrated auth

### Alternative 4: Auth0

**Philosophy:** Enterprise-grade auth platform  
**Official Docs:** https://auth0.com/docs

**Pros:**
- ✅ Enterprise features (SSO, MFA, compliance)
- ✅ Advanced security (anomaly detection)
- ✅ Highly scalable
- ✅ Great documentation

**Cons:**
- ❌ Expensive (enterprise pricing)
- ❌ Overkill for small apps
- ❌ Vendor lock-in

**When to use:** Enterprise apps, complex auth requirements, compliance needs

---

## 📊 Comparison Table

| Solution | Setup Time | OAuth | Cost | Control | Security | Best For |
|----------|------------|-------|------|---------|----------|----------|
| **Custom JWT** | ⭐⭐⭐ | ❌ | Free | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Learning, MVPs |
| NextAuth.js | ⭐⭐⭐⭐ | ✅ | Free | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Production apps |
| Clerk | ⭐⭐⭐⭐⭐ | ✅ | $$ | ⭐⭐ | ⭐⭐⭐⭐⭐ | Rapid prototyping |
| Supabase | ⭐⭐⭐⭐ | ✅ | $ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Supabase users |
| Auth0 | ⭐⭐⭐ | ✅ | $$$ | ⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise |

---

## 🔒 Security Best Practices

### 1. Environment Variables

```bash
# .env (NEVER commit to git!)
JWT_SECRET="your-super-secret-key-change-this-in-production"
```

**Rules:**
- ✅ Use long random strings (32+ characters)
- ✅ Different secrets per environment (dev, staging, prod)
- ✅ Rotate secrets periodically
- ❌ Never hardcode secrets in code
- ❌ Never commit `.env` to git

### 2. Password Requirements

```typescript
z.string()
  .min(8)        // Minimum 8 characters
  .max(72)       // bcrypt max
  .regex(/[A-Z]/)  // Optional: Require uppercase
  .regex(/[0-9]/)  // Optional: Require number
```

### 3. HTTPS Only

```typescript
// In production
if (process.env.NODE_ENV === 'production' && !req.secure) {
  throw new Error('HTTPS required');
}
```

### 4. Token Expiration

```typescript
const JWT_EXPIRY = '7d';  // Short-lived tokens
// Implement refresh tokens for longer sessions
```

### 5. Rate Limiting

```typescript
// Prevent brute force attacks
const loginAttempts = new Map();

if (loginAttempts.get(email) > 5) {
  throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
}
```

---

## 🤔 Reflection Questions

1. **Why hash passwords instead of encrypting them?**
   <details>
   <summary>Answer</summary>
   Hashing is one-way (can't reverse). Encryption is two-way (can decrypt). If attacker gets encryption key, they get all passwords. Hashes are safer.
   </details>

2. **What happens if JWT_SECRET leaks?**
   <details>
   <summary>Answer</summary>
   Attacker can forge valid tokens (impersonate users). Must immediately rotate secret and invalidate all existing tokens (force re-login).
   </details>

3. **Why store token in localStorage instead of cookies?**
   <details>
   <summary>Answer</summary>
   Simple for MVP. Production apps should use httpOnly cookies (XSS protection) with SameSite (CSRF protection). localStorage vulnerable to XSS.
   </details>

4. **What's the difference between authentication and authorization?**
   <details>
   <summary>Answer</summary>
   Authentication = "Who are you?" (login). Authorization = "What can you do?" (permissions/roles).
   </details>

5. **When should you use hosted auth (Clerk, Auth0)?**
   <details>
   <summary>Answer</summary>
   Need OAuth (social logins), don't want security responsibility, rapid development, enterprise compliance, team lacks auth expertise.
   </details>

---

## 🔗 Official Resources

- **JWT:** https://jwt.io/introduction
- **bcrypt:** https://www.npmjs.com/package/bcrypt
- **NextAuth.js:** https://next-auth.js.org
- **Clerk:** https://clerk.com/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Auth0:** https://auth0.com/docs
- **OWASP Auth Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

## ✅ Key Takeaways

- **Never store plaintext passwords** (use bcrypt hashing)
- **JWT tokens** provide stateless authentication
- **Context API + localStorage** manage client-side auth state
- **Protected layouts** guard routes with authentication checks
- **Custom auth** gives control but requires security expertise
- **Hosted auth** (Clerk, NextAuth) handles complexity for you
- **Production apps** should use httpOnly cookies, not localStorage

---

**Next:** [07. Monorepo & Workspaces →](./07-monorepo-workspaces.md)
