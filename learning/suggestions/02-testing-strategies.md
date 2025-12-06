# Testing Strategies

**Prerequisites:** Next.js basics, tRPC knowledge  
**Time to Read:** 45-55 minutes  
**Difficulty:** Intermediate

---

## 🎯 What You'll Learn

- Testing pyramid (unit, integration, E2E)
- Unit testing with Vitest
- Component testing with Testing Library
- E2E testing with Playwright
- tRPC testing patterns
- Test-driven development (TDD)
- Coverage reporting

---

## 📖 Why Test?

### The Value

**Analogy:**
- **No tests** = Driving without seatbelt (fast until crash)
- **Tests** = Safety net (confidence to refactor)

**Benefits:**
1. ✅ Catch bugs early (before users do)
2. ✅ Refactor safely (tests ensure behavior unchanged)
3. ✅ Documentation (tests show how code works)
4. ✅ Faster debugging (pinpoint exact failure)

---

## 🏗️ Testing Pyramid

### The Layers

```
     /\      E2E Tests (Few)
    /  \     - Slow, expensive
   /____\    - Test full user flows
  /      \   - Example: "User can login and create reminder"
 /        \  
/__________\ Integration Tests (Some)
/          \ - Test multiple units together
/            \- Example: "Auth router login with database"
/              \
/________________\ Unit Tests (Many)
                   - Fast, cheap
                   - Test single functions/components
                   - Example: "hashPassword returns bcrypt hash"
```

**Rule of thumb:**
- 70% Unit tests (fast, focused)
- 20% Integration tests (realistic interactions)
- 10% E2E tests (critical user flows)

---

## ✅ Unit Testing (Vitest)

### Setup

```bash
pnpm add -D vitest @vitejs/plugin-react
```

**Config:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',  // Browser-like environment
    globals: true,         // No need to import describe, it, expect
  },
});
```

### Testing Pure Functions

**Example:** `packages/api/src/lib/auth.ts`

```typescript
// auth.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, extractBearer } from './auth';

describe('extractBearer', () => {
  it('extracts token from valid Bearer header', () => {
    const token = extractBearer('Bearer abc123');
    expect(token).toBe('abc123');
  });

  it('returns null for missing header', () => {
    const token = extractBearer(undefined);
    expect(token).toBeNull();
  });

  it('returns null for invalid scheme', () => {
    const token = extractBearer('Basic abc123');
    expect(token).toBeNull();
  });

  it('returns null for malformed header', () => {
    const token = extractBearer('Bearer');
    expect(token).toBeNull();
  });
});

describe('hashPassword', () => {
  it('returns bcrypt hash', async () => {
    const hash = await hashPassword('password123');
    expect(hash).toMatch(/^\$2[ab]\$.{56}$/);  // bcrypt format
  });

  it('generates different hashes for same password', async () => {
    const hash1 = await hashPassword('password123');
    const hash2 = await hashPassword('password123');
    expect(hash1).not.toBe(hash2);  // Salt makes each unique
  });
});

describe('verifyPassword', () => {
  it('returns true for correct password', async () => {
    const hash = await hashPassword('password123');
    const valid = await verifyPassword('password123', hash);
    expect(valid).toBe(true);
  });

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('password123');
    const valid = await verifyPassword('wrongPassword', hash);
    expect(valid).toBe(false);
  });
});
```

**Run tests:**

```bash
pnpm vitest         # Watch mode
pnpm vitest run     # Run once
pnpm vitest --coverage  # With coverage report
```

---

## 🧩 Component Testing (Testing Library)

### Setup

```bash
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Testing Forms

**Example:** Login form

```tsx
// login.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, describe, vi } from 'vitest';
import LoginForm from './login-form';

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'not-an-email');
    await user.tab();  // Trigger blur
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('disables submit button while loading', () => {
    render(<LoginForm isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });
});
```

### Testing Library Principles

**✅ Good (test user behavior):**

```tsx
// User sees label, clicks button
screen.getByLabelText(/email/i);
screen.getByRole('button', { name: /submit/i });
screen.getByText(/welcome/i);
```

**❌ Bad (test implementation details):**

```tsx
// Coupled to implementation
wrapper.find('.email-input');
wrapper.find('#submit-btn');
wrapper.state('isLoading');
```

**Why?** Tests should survive refactoring (change CSS class → tests still pass)

---

## 🔄 Testing tRPC

### Mocking tRPC Client

**Problem:** Don't want real API calls in tests

**Solution:** Mock tRPC client

```tsx
// __tests__/setup.ts
import { vi } from 'vitest';

export const mockTrpc = {
  auth: {
    login: {
      useMutation: vi.fn(() => ({
        mutateAsync: vi.fn(),
        isLoading: false,
        error: null,
      })),
    },
  },
  reminder: {
    getAll: {
      useQuery: vi.fn(() => ({
        data: { reminders: [] },
        isLoading: false,
        error: null,
      })),
    },
  },
};

vi.mock('@/lib/trpc', () => ({
  trpc: mockTrpc,
}));
```

**Usage in tests:**

```tsx
import { render, screen } from '@testing-library/react';
import { mockTrpc } from './__tests__/setup';
import Dashboard from './dashboard';

describe('Dashboard', () => {
  it('shows loading state', () => {
    mockTrpc.reminder.getAll.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    
    render(<Dashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders reminders', () => {
    mockTrpc.reminder.getAll.useQuery.mockReturnValue({
      data: {
        reminders: [
          { id: '1', title: 'Buy milk', message: 'At store' },
        ],
      },
      isLoading: false,
      error: null,
    });
    
    render(<Dashboard />);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });
});
```

### Testing tRPC Routers (Backend)

**Example:** Auth router

```typescript
// auth.router.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createCaller } from '@trpc/server';
import { appRouter } from '../index';
import { createContext } from '../context';
import { prisma } from '@repo/db';

describe('auth router', () => {
  const caller = createCaller(appRouter, await createContext());

  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany();
  });

  describe('register', () => {
    it('creates user and returns token', async () => {
      const result = await caller.auth.register({
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
      });

      expect(result.user).toMatchObject({
        email: 'test@example.com',
        phoneNumber: '+1234567890',
      });
      expect(result.token).toBeTypeOf('string');
    });

    it('throws CONFLICT for duplicate email', async () => {
      await caller.auth.register({
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
      });

      await expect(
        caller.auth.register({
          email: 'test@example.com',
          password: 'different',
          phoneNumber: '+0987654321',
        })
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('login', () => {
    it('returns token for valid credentials', async () => {
      // Setup: Create user
      await caller.auth.register({
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
      });

      // Test: Login
      const result = await caller.auth.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBeTypeOf('string');
    });

    it('throws UNAUTHORIZED for wrong password', async () => {
      await caller.auth.register({
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '+1234567890',
      });

      await expect(
        caller.auth.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

---

## 🎭 E2E Testing (Playwright)

### Setup

```bash
pnpm create playwright
```

**Config:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Writing E2E Tests

**Example:** Full user flow

```typescript
// e2e/reminder-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Reminder Flow', () => {
  test('user can register, login, and create reminder', async ({ page }) => {
    // 1. Go to register page
    await page.goto('/register');

    // 2. Fill registration form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByLabel(/phone/i).fill('+1234567890');
    
    // 3. Submit form
    await page.getByRole('button', { name: /register/i }).click();

    // 4. Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // 5. Create reminder
    await page.getByRole('button', { name: /new reminder/i }).click();
    await page.getByLabel(/title/i).fill('Buy milk');
    await page.getByLabel(/message/i).fill('At grocery store');
    await page.getByLabel(/scheduled for/i).fill('2025-12-31T10:00');
    await page.getByRole('button', { name: /create/i }).click();

    // 6. Verify reminder appears
    await expect(page.getByText('Buy milk')).toBeVisible();

    // 7. Delete reminder
    await page.getByRole('button', { name: /delete/i }).first().click();
    
    // 8. Verify reminder removed
    await expect(page.getByText('Buy milk')).not.toBeVisible();
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.getByRole('button', { name: /login/i }).click();

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('handles auth errors', async ({ page }) => {
    await page.goto('/login');

    // Try wrong credentials
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongPassword');
    await page.getByRole('button', { name: /login/i }).click();

    // Check for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });
});
```

**Run tests:**

```bash
pnpm playwright test              # Run all tests
pnpm playwright test --ui         # Interactive UI
pnpm playwright test --debug      # Debug mode
pnpm playwright codegen           # Record tests
```

---

## 🔴 Test-Driven Development (TDD)

### The Cycle

```
RED → GREEN → REFACTOR → Repeat

1. RED: Write failing test (no implementation)
2. GREEN: Write minimal code to pass
3. REFACTOR: Improve code (tests ensure behavior unchanged)
```

### Example: TDD for extractBearer

**Step 1: RED (write failing test)**

```typescript
// auth.test.ts
import { describe, it, expect } from 'vitest';
import { extractBearer } from './auth';

describe('extractBearer', () => {
  it('extracts token from valid Bearer header', () => {
    const token = extractBearer('Bearer abc123');
    expect(token).toBe('abc123');  // FAILS (function doesn't exist)
  });
});
```

**Step 2: GREEN (minimal implementation)**

```typescript
// auth.ts
export function extractBearer(headerValue: string): string | null {
  return 'abc123';  // Hardcoded to pass test
}
```

Test passes! ✅

**Step 3: Add more tests (RED)**

```typescript
it('returns null for missing header', () => {
  const token = extractBearer(undefined);
  expect(token).toBeNull();  // FAILS
});

it('returns null for invalid scheme', () => {
  const token = extractBearer('Basic abc123');
  expect(token).toBeNull();  // FAILS
});
```

**Step 4: Real implementation (GREEN)**

```typescript
export function extractBearer(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer') return null;
  return token || null;
}
```

All tests pass! ✅

**Step 5: REFACTOR**

```typescript
// Extract magic string
const BEARER_SCHEME = 'bearer';

export function extractBearer(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== BEARER_SCHEME) return null;
  return token || null;
}
```

Tests still pass! ✅ Refactor successful.

---

## 📊 Coverage Reporting

### Setup

```bash
pnpm vitest --coverage
```

**Output:**

```
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
auth.ts            |   100   |   100    |   100   |   100   |
reminder.router.ts |   85.7  |   75     |   100   |   85.7  |
whatsapp.ts        |   0     |   0      |   0     |   0     |  ❌ No tests!
```

**Goals:**
- Critical paths: 100% coverage (auth, payments)
- Business logic: 80%+ coverage
- UI components: 60%+ coverage (diminishing returns)

**Don't chase 100%!** Focus on valuable tests, not metrics.

---

## 🌍 Our Tech vs Alternatives

### What We'd Use: Vitest

**Philosophy:** Vite-native test runner  
**Official Docs:** https://vitest.dev

**Pros:**
- ✅ Fastest test runner (Vite's speed)
- ✅ Compatible with Jest API (easy migration)
- ✅ Native ESM support
- ✅ TypeScript out of the box
- ✅ Great DX (watch mode, UI)

**Cons:**
- ❌ Newer (less mature than Jest)
- ❌ Smaller ecosystem

**Best for:** Vite projects, greenfield apps, TypeScript

### Alternative 1: Jest

**Philosophy:** Comprehensive testing framework  
**Official Docs:** https://jestjs.io

**Pros:**
- ✅ Most popular (huge ecosystem)
- ✅ Snapshot testing
- ✅ Built-in mocking
- ✅ Mature and stable

**Cons:**
- ❌ Slower than Vitest
- ❌ ESM support clunky
- ❌ More configuration

**When to use:** Existing projects, need ecosystem, React Native

### Alternative 2: Playwright vs Cypress

| Feature | Playwright | Cypress |
|---------|-----------|---------|
| **Speed** | Faster (parallel) | Slower (serial) |
| **Browsers** | Chromium, Firefox, WebKit | Chromium, Firefox |
| **Network stubbing** | ✅ Built-in | ✅ Built-in |
| **Auto-wait** | ✅ Yes | ✅ Yes |
| **Debugging** | VS Code | Cypress UI |
| **Ecosystem** | Newer | More mature |

**Playwright:** Modern, fast, cross-browser  
**Cypress:** Better DX, more plugins, easier debugging

---

## 🤔 Reflection Questions

1. **Why more unit tests than E2E tests?**
   <details>
   <summary>Answer</summary>
   Unit tests are fast (run in milliseconds), pinpoint failures (exact function), cheap to maintain. E2E tests are slow (seconds/minutes), brittle (break with UI changes), expensive.
   </details>

2. **What should you test in components?**
   <details>
   <summary>Answer</summary>
   User behavior: Does it render? Can user interact? Does it show errors? NOT implementation details (state, CSS classes).
   </details>

3. **How do you test tRPC routers?**
   <details>
   <summary>Answer</summary>
   Create caller with `createCaller`, call procedures directly, assert on response/errors. Mock database for isolation.
   </details>

4. **When is TDD worth it?**
   <details>
   <summary>Answer</summary>
   Complex logic (algorithms), critical paths (auth, payments), public APIs (contracts), refactoring legacy code. NOT prototyping/UI exploration.
   </details>

5. **What's a good coverage target?**
   <details>
   <summary>Answer</summary>
   80% overall, 100% for critical paths. Don't chase 100% everywhere - focus on valuable tests, not metrics.
   </details>

---

## 🔗 Official Resources

- **Vitest:** https://vitest.dev
- **Jest:** https://jestjs.io
- **Testing Library:** https://testing-library.com
- **Playwright:** https://playwright.dev
- **Cypress:** https://www.cypress.io
- **Kent C. Dodds (Testing):** https://kentcdodds.com/blog/write-tests

---

## ✅ Key Takeaways

- **Testing pyramid:** Many unit, some integration, few E2E
- **Vitest** for fast unit tests with great DX
- **Testing Library** for component tests (user behavior)
- **Playwright** for E2E tests (full user flows)
- **TDD** ensures testable code, iterative design
- **Coverage** is a guide, not a goal
- **Tradeoff:** Test maintenance vs bug prevention

---

**Back to:** [Advanced Topics Index →](./README.md)
