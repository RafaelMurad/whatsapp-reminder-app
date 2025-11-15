# Design System & Component Architecture Strategy

**Purpose:** Transform our current component usage into a scalable, accessible, maintainable design system.

**Created:** November 15, 2025
**Status:** Strategy Document - Ready for Implementation

---

## Current State Analysis

### What We Have Now

**shadcn/ui Primitives** (`components/ui/`):
- ✅ Button, Card, Dialog, Form, Input, Label
- ✅ Sonner (toast notifications)
- ✅ All accessible (built on Radix UI)
- ✅ Customizable via Tailwind

**Custom Components**:
- `providers.tsx` - App-wide providers (Auth, tRPC, QueryClient)

**Page Components** (`app/(auth)/*`, `app/(protected)/*`):
- Login page - 180 lines
- Register page - 215 lines
- Dashboard page - 100 lines
- Home page - 55 lines

### Identified Patterns (Repetition = Opportunity)

**Pattern 1: Form Field with Error**
```tsx
// REPEATED 5 times across login + register
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    disabled={isLoading}
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
    className={cn(errors.email && "border-destructive")}
  />
  {errors.email && (
    <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
      <span className="text-base">⚠</span>
      {errors.email}
    </p>
  )}
</div>
```

**Pattern 2: Error Message Display**
```tsx
// REPEATED 8 times
<p className="text-sm text-destructive flex items-center gap-1">
  <span className="text-base">⚠</span>
  {error.message}
</p>
```

**Pattern 3: General Error Alert**
```tsx
// REPEATED 2 times
<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
  <span className="text-base mt-0.5">⚠</span>
  <p>{errors.general}</p>
</div>
```

**Pattern 4: Auth Form Card**
```tsx
// Login and Register share 90% structure
<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
  <form onSubmit={handleSubmit}>
    <CardContent>{fields}</CardContent>
    <CardFooter>{submitButton + footer}</CardFooter>
  </form>
</Card>
```

---

## Design System Goals

### 1. Component Hierarchy

```
components/
├── ui/                    # shadcn/ui primitives (as-is)
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── form/                  # Form-specific components (NEW)
│   ├── field.tsx          # FormField with label + error
│   ├── error-message.tsx  # Inline error display
│   └── error-alert.tsx    # General error box
├── auth/                  # Auth-specific patterns (NEW)
│   ├── auth-card.tsx      # Login/Register card wrapper
│   └── auth-form-field.tsx # Field with auth error handling
└── layout/                # Layout components (NEW)
    ├── page-header.tsx
    ├── dashboard-shell.tsx
    └── centered-container.tsx
```

### 2. Composition Patterns

**Atomic Design Principles:**

**Atoms** = shadcn/ui components (Button, Input, Label)
**Molecules** = FormField (Label + Input + Error)
**Organisms** = AuthCard (Header + Form + Footer)
**Templates** = Auth Layout, Dashboard Layout
**Pages** = Login, Register, Dashboard

---

## Implementation Plan

### Phase 1: Extract Form Components (High ROI)

**Create `components/form/field.tsx`:**
```tsx
interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement; // Input, Textarea, Select, etc.
}

export function FormField({
  label,
  error,
  hint,
  required,
  children
}: FormFieldProps) {
  const id = children.props.id || useId();
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : hintId,
        className: cn(children.props.className, error && "border-destructive"),
      })}

      {error ? (
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
```

**Usage:**
```tsx
// Before: 15 lines
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    disabled={isLoading}
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
    className={cn(errors.email && "border-destructive")}
  />
  {errors.email && <ErrorMessage id="email-error">{errors.email}</ErrorMessage>}
</div>

// After: 8 lines
<FormField
  label="Email"
  error={errors.email}
  required
>
  <Input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    disabled={isLoading}
  />
</FormField>
```

**Benefits:**
- 50% less code
- Consistent error handling
- Accessibility baked in
- Easy to test
- Single place to update error styling

---

### Phase 2: Extract Auth Components (Domain-Specific)

**Create `components/auth/auth-card.tsx`:**
```tsx
interface AuthCardProps {
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  isLoading?: boolean;
  generalError?: string;
  footerLink?: {
    text: string;
    linkText: string;
    href: string;
  };
  children: React.ReactNode; // Form fields
}

export function AuthCard({
  title,
  description,
  onSubmit,
  submitLabel,
  isLoading,
  generalError,
  footerLink,
  children,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {generalError && <ErrorAlert>{generalError}</ErrorAlert>}
            {children}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : submitLabel}
            </Button>
            {footerLink && (
              <p className="text-sm text-muted-foreground text-center">
                {footerLink.text}{" "}
                <Link href={footerLink.href} className="font-medium text-primary hover:underline">
                  {footerLink.linkText}
                </Link>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

**Usage:**
```tsx
// Login page becomes ~50 lines instead of 180
export default function LoginPage() {
  const { email, password, errors, isLoading, handleSubmit, setEmail, setPassword } = useLoginForm();

  return (
    <AuthCard
      title="Login"
      description="Sign in to your WhatsApp Reminder account"
      onSubmit={handleSubmit}
      submitLabel="Sign in"
      isLoading={isLoading}
      generalError={errors.general}
      footerLink={{
        text: "Don't have an account?",
        linkText: "Sign up",
        href: "/register",
      }}
    >
      <FormField label="Email" error={errors.email} required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Password" error={errors.password} required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </FormField>
    </AuthCard>
  );
}
```

---

### Phase 3: Extract Custom Hooks (Logic Separation)

**Create `hooks/use-login-form.ts`:**
```tsx
export function useLoginForm() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setErrors({});
      authLogin(data.token, {
        id: data.user.id,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
      });
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error) => {
      const newErrors = parseAuthError(error, ["email", "password"]);
      if (newErrors.general && !newErrors.general.includes("Invalid email")) {
        toast.error(newErrors.general);
      }
      setErrors(newErrors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    loginMutation.mutate({ email, password });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    isLoading: loginMutation.isPending,
    handleSubmit,
  };
}
```

**Benefits:**
- Page component focuses on UI structure
- Logic is testable in isolation
- Reusable if needed
- Easier to understand

---

## Accessibility Checklist

### Current Status: ✅ Good Foundation

**What we're doing right:**
- ✅ Using shadcn/ui (built on Radix UI)
- ✅ `aria-invalid` on error fields
- ✅ `aria-describedby` linking errors to inputs
- ✅ Semantic HTML (`<form>`, `<button type="submit">`)
- ✅ `<Label>` properly associated with inputs

### Enhancements Needed:

**1. Focus Management**
```tsx
// Auto-focus first error field
const firstErrorRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (errors.email) {
    firstErrorRef.current?.focus();
  }
}, [errors.email]);
```

**2. Loading States**
```tsx
// Announce loading to screen readers
<Button type="submit" disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? "Signing in..." : "Sign in"}
</Button>
```

**3. Error Announcements**
```tsx
// Use live region for dynamic errors
<div role="alert" aria-live="assertive">
  {errors.general && <ErrorAlert>{errors.general}</ErrorAlert>}
</div>
```

**4. Skip Links**
```tsx
// For dashboard navigation
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## Component Library Best Practices

### 1. API Design Principles

**Consistent Props Pattern:**
```tsx
// All input-like components accept these
interface BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}
```

**Composition over Configuration:**
```tsx
// Good: Flexible composition
<FormField label="Email" error={errors.email}>
  <Input type="email" {...emailProps} />
</FormField>

// Avoid: Too many props
<FormField
  label="Email"
  type="email"
  error={errors.email}
  inputType="email"
  inputPlaceholder="..."
  inputValue={...}
  // Too rigid!
/>
```

### 2. Type Safety

**Strict TypeScript:**
```tsx
// Export prop types for reuse
export type FormFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement<{ id?: string }>;
};

// Use discriminated unions for variants
type ButtonVariant = "default" | "destructive" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
```

### 3. Documentation

**Component Documentation Template:**
```tsx
/**
 * FormField - Accessible form field with label, input, and error display
 *
 * @example
 * ```tsx
 * <FormField label="Email" error={errors.email} required>
 *   <Input type="email" value={email} onChange={setEmail} />
 * </FormField>
 * ```
 *
 * @param label - Field label text
 * @param error - Error message to display
 * @param hint - Helper text (shown when no error)
 * @param required - Show required indicator (*)
 * @param children - Single input element
 */
```

---

## Migration Path

### Week 1: Foundation
1. ✅ Create `components/form/` directory
2. ✅ Extract `<FormField>` component
3. ✅ Extract `<ErrorMessage>` component
4. ✅ Extract `<ErrorAlert>` component
5. ✅ Update login page to use new components
6. ✅ Update register page to use new components

### Week 2: Auth System
1. ✅ Create `components/auth/` directory
2. ✅ Extract `<AuthCard>` component
3. ✅ Create `hooks/use-login-form.ts`
4. ✅ Create `hooks/use-register-form.ts`
5. ✅ Refactor login page (target: <50 lines)
6. ✅ Refactor register page (target: <60 lines)

### Week 3: Dashboard System
1. ✅ Create `components/layout/` directory
2. ✅ Extract `<DashboardShell>` (header + main)
3. ✅ Extract `<PageHeader>` component
4. ✅ Create reminder components (Day 3 work)

### Week 4: Polish & Documentation
1. ✅ Add Storybook (optional)
2. ✅ Document all components
3. ✅ Add accessibility tests
4. ✅ Performance optimization

---

## Learning Outcomes

### Component Composition
- **Separation of Concerns:** UI vs Logic vs Data
- **Props Drilling Solutions:** Context, Composition, Render Props
- **Compound Components:** AuthCard with CardHeader, CardContent, CardFooter
- **Controlled vs Uncontrolled:** When to use each

### Design System Patterns
- **Atomic Design:** Atoms → Molecules → Organisms → Templates → Pages
- **Token System:** Colors, spacing, typography (Tailwind config)
- **Variant System:** Primary, secondary, destructive, ghost
- **Responsive Design:** Mobile-first, breakpoints

### Accessibility
- **ARIA Attributes:** roles, states, properties
- **Keyboard Navigation:** Tab order, focus management
- **Screen Readers:** Semantic HTML, live regions
- **WCAG Guidelines:** AA compliance (contrast, touch targets)

---

## Next Steps

**Ready to implement Phase 1?**

1. Create `components/form/error-message.tsx`
2. Create `components/form/error-alert.tsx`
3. Create `components/form/field.tsx`
4. Update login page to use `<FormField>`
5. Update register page to use `<FormField>`
6. Commit: "feat(web): create reusable form components"

**Estimated time:** 1-2 hours
**Impact:** Reduce auth page code by 60%, establish pattern for all future forms

---

**Questions to consider:**
1. Start with Phase 1 (form components) or dive straight into Phase 2 (AuthCard)?
2. Extract hooks now or after component extraction?
3. Add Storybook for component documentation?

**My recommendation:** Phase 1 → Test → Phase 2 → Test → Phase 3
