# shadcn/ui Component System

**Prerequisites:** Design System Fundamentals, Next.js Architecture  
**Time to Read:** 25-35 minutes  
**Difficulty:** Intermediate

---

## 🎯 What You'll Learn

- Copy-paste philosophy vs npm packages
- Radix UI primitives and accessibility
- CLI-based component installation
- Customization through code ownership
- Variant-driven component design

---

## 📖 What is shadcn/ui?

### Simple Definition
**shadcn/ui** is NOT a component library you install via npm. It's a **collection of copy-paste components** built on top of Radix UI primitives that you add to your project and own completely.

**Analogy:** 
- **Traditional libraries** (Material-UI, Chakra) = Buying furniture from IKEA (you get what they designed)
- **shadcn/ui** = Getting blueprints and wood (you build it exactly how you want)

### The Philosophy Shift

**Traditional Component Libraries:**
```bash
npm install @mui/material
```
```tsx
import { Button } from '@mui/material';
// You don't own this code
// To customize deeply, you fight the library
```

**shadcn/ui Approach:**
```bash
npx shadcn@latest add button
```
```tsx
// Code is copied into YOUR project
// apps/web/components/ui/button.tsx
// You own it, modify it however you want
```

### Why This Matters

**Problems with traditional libraries:**
1. **Bundle bloat** - You include the entire library even if you use 3 components
2. **Customization hell** - Deep customization requires complex overrides
3. **Update anxiety** - Updates might break your customizations
4. **No ownership** - You can't see or modify the source code easily

**shadcn/ui solutions:**
1. ✅ **Zero bundle bloat** - Only the components you use exist in your codebase
2. ✅ **Easy customization** - It's just TypeScript/React code you own
3. ✅ **Update control** - Update components individually when YOU want
4. ✅ **Full ownership** - Code is in your repo, modify freely

---

## 🧱 Built on Radix UI Primitives

### What is Radix UI?

**Radix UI** provides unstyled, accessible component primitives with complex behavior already implemented.

**Think of it as:**
- **Radix UI** = The engineering (accessibility, keyboard nav, focus management)
- **shadcn/ui** = The design (Tailwind styling, variants, visual polish)

### Example: Dialog Component

**What Radix provides:**
```tsx
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**What this gives you (for FREE):**
- ✅ Focus trap (you can't tab out of the dialog)
- ✅ Escape key closes dialog
- ✅ Click outside to close
- ✅ ARIA attributes (`role="dialog"`, `aria-labelledby`, etc.)
- ✅ Body scroll lock when open
- ✅ Keyboard navigation
- ✅ Screen reader announcements

**What you still need to add:**
- ❌ Styling (colors, spacing, animations)
- ❌ Variants (sizes, different styles)

**What shadcn/ui adds:**

```tsx
// apps/web/components/ui/dialog.tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
        "w-full max-w-lg rounded-lg bg-background p-6",
        "shadow-lg border",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
```

**Now you get:**
- ✅ All Radix accessibility features
- ✅ Beautiful Tailwind styling
- ✅ Centered modal
- ✅ Backdrop blur
- ✅ Customizable via `className` prop

---

## 🛠️ CLI-Based Installation

### How You Add Components

**Step 1: Install shadcn CLI (one time)**
```bash
npx shadcn@latest init
```

This creates:
- `components.json` - Configuration file
- `lib/utils.ts` - Utility functions (like `cn()`)
- `app/globals.css` - CSS variables for theming

**Step 2: Add components as needed**
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
```

**What this does:**
1. Downloads component code from GitHub
2. Places it in `components/ui/` folder
3. Installs required dependencies (Radix packages)
4. Component is now YOURS to customize

### Components in Our Project

From our `package.json`:
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",  // For Dialog component
    "@radix-ui/react-label": "^2.1.8",    // For Label component
    "@radix-ui/react-slot": "^1.2.4"      // For Button asChild prop
  }
}
```

Components we've added:
```
apps/web/components/ui/
├── button.tsx      // Primary interactive element
├── card.tsx        // Content container
├── dialog.tsx      // Modal overlays
├── form.tsx        // Form component + React Hook Form integration
├── input.tsx       // Text input field
├── label.tsx       // Form field label
└── sonner.tsx      // Toast notifications
```

---

## 🎨 Variant-Driven Design

### What Are Variants?

Variants allow one component to have multiple visual styles without creating separate components.

### Example from Our Button Component

```tsx
// apps/web/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  // Base styles (always applied)
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all disabled:opacity-50",
  {
    variants: {
      // Different visual styles
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Different sizes
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Using Variants

```tsx
// Default button
<Button>Click Me</Button>
// Renders: bg-primary, h-9, px-4

// Destructive button
<Button variant="destructive">Delete</Button>
// Renders: bg-destructive, h-9, px-4

// Small outline button
<Button variant="outline" size="sm">Cancel</Button>
// Renders: border, bg-background, h-8, px-3

// Icon button
<Button variant="ghost" size="icon">
  <TrashIcon />
</Button>
// Renders: hover:bg-accent, size-9
```

### Why Use class-variance-authority (CVA)?

**Without CVA** (manual className strings):
```tsx
function Button({ variant, size }) {
  let className = "base-styles ";
  if (variant === "default") className += "bg-primary ";
  if (variant === "destructive") className += "bg-destructive ";
  if (size === "sm") className += "h-8 px-3";
  // ... gets messy fast
  return <button className={className} />;
}
```

**With CVA** (declarative variants):
```tsx
const buttonVariants = cva("base-styles", {
  variants: { variant: {...}, size: {...} }
});
// Clean, typed, easy to maintain
```

---

## 🔧 Customization Examples

### Example 1: Modify Existing Variant

**Before:**
```tsx
// components/ui/button.tsx
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
}
```

**After (more rounded, shadow):**
```tsx
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg",
}
```

All buttons using `variant="default"` now have rounded corners and shadows!

### Example 2: Add New Variant

```tsx
// components/ui/button.tsx
variant: {
  default: "bg-primary...",
  destructive: "bg-destructive...",
  outline: "border...",
  // ADD NEW VARIANT
  premium: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700",
}
```

```tsx
// Use it anywhere
<Button variant="premium">Upgrade to Pro</Button>
```

### Example 3: Add Icon Support

```tsx
// components/ui/button.tsx
function Button({ icon, children, ...props }) {
  return (
    <button {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
```

```tsx
// Use it
<Button icon={<PlusIcon />}>Add Reminder</Button>
```

**You OWN the code, so you can modify however you want!**

---

## 🌍 Our Tech vs Alternatives

### What We Use: shadcn/ui + Radix UI

**Philosophy:** Copy-paste components you own  
**Official Docs:** https://ui.shadcn.com

**Pros:**
- ✅ Full code ownership
- ✅ Zero bundle bloat
- ✅ Easy deep customization
- ✅ Accessibility built-in (Radix)
- ✅ Works with Tailwind (our CSS framework)

**Cons:**
- ❌ No automatic updates
- ❌ More initial setup
- ❌ You maintain the code

**Best for:** Apps needing custom designs with full control

### Alternative 1: Headless UI

**Philosophy:** Unstyled accessible components by Tailwind team  
**Official Docs:** https://headlessui.com

**Pros:**
- ✅ Built by Tailwind team (perfect integration)
- ✅ Tiny bundle size
- ✅ Completely unstyled (total freedom)
- ✅ Great TypeScript support

**Cons:**
- ❌ Fewer components than Radix
- ❌ You style everything from scratch (no starting point)

**Key Difference from shadcn/ui:**
```tsx
// Headless UI - no styling at all
<Dialog>
  <DialogPanel className="...">  {/* You add ALL styles */}
    <DialogTitle>Title</DialogTitle>
  </DialogPanel>
</Dialog>

// shadcn/ui - styled starting point
<Dialog>
  <DialogContent>  {/* Already has good default styles */}
    <DialogTitle>Title</DialogTitle>
  </DialogContent>
</Dialog>
```

**When to use:** You want Tailwind integration + total styling freedom

### Alternative 2: Ariakit

**Philosophy:** Accessible components with styling flexibility  
**Official Docs:** https://ariakit.org

**Pros:**
- ✅ Excellent accessibility
- ✅ Great composability
- ✅ Works with any styling solution
- ✅ Smaller than Radix

**Cons:**
- ❌ Less popular than Radix
- ❌ Smaller community

**When to use:** Accessibility is top priority, smaller bundle needed

### Alternative 3: React Aria (Adobe)

**Philosophy:** Hooks for building accessible components  
**Official Docs:** https://react-spectrum.adobe.com/react-aria/

**Pros:**
- ✅ Backed by Adobe (enterprise-grade)
- ✅ Internationalization built-in
- ✅ Mobile touch support
- ✅ Very comprehensive

**Cons:**
- ❌ More complex API (hooks-based)
- ❌ Steeper learning curve
- ❌ More boilerplate

**Key Difference:**
```tsx
// React Aria - hooks-based
import { useButton } from 'react-aria';

function Button(props) {
  const ref = React.useRef();
  const { buttonProps } = useButton(props, ref);
  return <button {...buttonProps} ref={ref}>{props.children}</button>;
}

// Radix/shadcn - component-based (simpler)
<Button>Click Me</Button>
```

**When to use:** Enterprise apps needing i18n, mobile support

### Alternative 4: Reach UI

**Philosophy:** Accessible React components  
**Official Docs:** https://reach.tech

**Pros:**
- ✅ Simple API
- ✅ Good accessibility
- ✅ Small size

**Cons:**
- ❌ Less actively maintained
- ❌ Smaller component library
- ❌ Less modern than Radix

**When to use:** You were - it's largely been superseded by Radix/Headless UI

---

## 📊 Comparison Table

| Library | Bundle Size | Accessibility | Styling | Maintenance | Learning Curve |
|---------|-------------|---------------|---------|-------------|----------------|
| **shadcn/ui** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Headless UI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Radix UI | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| React Aria | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Ariakit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🤔 Reflection Questions

1. **Why copy-paste components instead of `npm install`?**
   <details>
   <summary>Answer</summary>
   Code ownership = full customization freedom, zero bundle bloat, no update conflicts, easier debugging (code is in your repo).
   </details>

2. **What does Radix UI provide that you'd otherwise have to build yourself?**
   <details>
   <summary>Answer</summary>
   Accessibility (ARIA attributes, keyboard nav, focus management, screen reader support), complex interactions (modals, dropdowns, tooltips), cross-browser compatibility.
   </details>

3. **When would CVA (class-variance-authority) be overkill?**
   <details>
   <summary>Answer</summary>
   Simple components with only 1-2 style variations. Just use conditional classNames instead.
   </details>

4. **How do you update a shadcn/ui component after installing it?**
   <details>
   <summary>Answer</summary>
   Manually edit the code in `components/ui/`. You own it! Or re-run `npx shadcn add component` to overwrite with latest version.
   </details>

5. **When would you choose Headless UI over shadcn/ui?**
   <details>
   <summary>Answer</summary>
   When you want absolute minimal code and plan to style everything from scratch. Or when you only need 1-2 simple components.
   </details>

---

## 🔗 Official Resources

- **shadcn/ui Docs:** https://ui.shadcn.com/docs
- **Radix UI Docs:** https://www.radix-ui.com/primitives/docs/overview/introduction
- **CVA Docs:** https://cva.style/docs
- **Headless UI Docs:** https://headlessui.com
- **React Aria Docs:** https://react-spectrum.adobe.com/react-aria/
- **Ariakit Docs:** https://ariakit.org

---

## ✅ Key Takeaways

- shadcn/ui is a **collection of copy-paste components**, not an npm library
- Built on **Radix UI primitives** for accessibility + behavior
- You **own the code** = full customization freedom
- **CVA** enables clean, type-safe variant systems
- Tradeoff: Manual updates vs complete control
- Best when you need **custom design** with **accessible foundations**

---

**Next:** [04. Tailwind CSS + Theming →](./04-tailwind-theming.md)
