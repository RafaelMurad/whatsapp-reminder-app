# Tailwind CSS + Theming

**Prerequisites:** Design System Fundamentals, shadcn/ui System  
**Time to Read:** 30-40 minutes  
**Difficulty:** Intermediate

---

## 🎯 What You'll Learn

- Utility-first CSS philosophy
- CSS variables for dynamic theming
- Dark mode implementation
- Responsive design patterns
- Custom design tokens in Tailwind
- Performance benefits

---

## 📖 What is Tailwind CSS?

### Simple Definition
**Tailwind** is a utility-first CSS framework where you style elements by composing small, single-purpose classes instead of writing custom CSS.

**Analogy:**
- **Traditional CSS** = Ordering a custom-made suit (write CSS for everything)
- **Tailwind** = Building outfits from a wardrobe (combine existing pieces)

### The Paradigm Shift

**Traditional CSS:**
```css
/* styles.css */
.button {
  background-color: #8B5CF6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

.button:hover {
  background-color: #7C3AED;
}
```
```html
<button class="button">Click Me</button>
```

**Tailwind CSS:**
```html
<button class="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700">
  Click Me
</button>
```

No CSS file needed! Classes directly describe the styling.

### Why This Matters

**Traditional CSS problems:**
1. **Naming things is hard** - What do you call the 17th button variant?
2. **Dead CSS** - Delete a component, forget to delete its CSS
3. **Context switching** - Jump between HTML and CSS files
4. **Specificity wars** - `.button.button.button` to override styles
5. **File bloat** - CSS files grow indefinitely

**Tailwind solutions:**
1. ✅ **No naming needed** - Classes are descriptive (`bg-purple-600`)
2. ✅ **No dead CSS** - Delete HTML = delete styles
3. ✅ **Single file** - Styles live with the component
4. ✅ **No specificity issues** - All utilities have same weight
5. ✅ **Tiny production builds** - Only used classes included

---

## 🎨 Utility-First Philosophy

### What Are Utility Classes?

Each class does ONE thing:

| Class | What it does | CSS equivalent |
|-------|--------------|----------------|
| `flex` | Display flex | `display: flex` |
| `items-center` | Align items | `align-items: center` |
| `gap-4` | Gap spacing | `gap: 1rem` |
| `text-white` | Text color | `color: white` |
| `bg-purple-600` | Background | `background-color: #8B5CF6` |
| `rounded-md` | Border radius | `border-radius: 0.5rem` |
| `hover:bg-purple-700` | Hover state | `background-color: #7C3AED` (on hover) |

### Building Complex Designs

Combine utilities to create sophisticated UIs:

```tsx
// Our Button component (from apps/web/components/ui/button.tsx)
<button className="
  inline-flex           // display: inline-flex
  items-center          // align-items: center
  justify-center        // justify-content: center
  gap-2                 // gap: 0.5rem
  whitespace-nowrap     // white-space: nowrap
  rounded-md            // border-radius: 0.5rem
  text-sm               // font-size: 0.875rem
  font-medium           // font-weight: 500
  transition-all        // transition: all
  disabled:opacity-50   // opacity: 0.5 (when disabled)
  hover:bg-primary/90   // background-color with 90% opacity (on hover)
  bg-primary            // background-color: var(--primary)
  text-primary-foreground // color: var(--primary-foreground)
  h-9                   // height: 2.25rem
  px-4                  // padding-left/right: 1rem
  py-2                  // padding-top/bottom: 0.5rem
">
  Click Me
</button>
```

**Result:** A fully styled, accessible button without writing a single line of CSS!

---

## 🌗 CSS Variables for Dynamic Theming

### The Problem: Hard-Coded Colors

**Without CSS variables:**
```tsx
// Light mode
<div className="bg-white text-gray-900" />

// Dark mode
<div className="dark:bg-gray-900 dark:text-white" />
```

❌ Colors duplicated everywhere  
❌ Hard to change theme globally  
❌ Can't smoothly transition between themes

### The Solution: CSS Variables

**Our approach (from `apps/web/app/globals.css`):**

```css
:root {
  /* Light mode variables */
  --background: oklch(1 0 0);          /* White */
  --foreground: oklch(0.141 0.005 285.823);  /* Dark gray */
  --primary: oklch(0.571 0.207 293.334);     /* Purple */
}

.dark {
  /* Dark mode variables */
  --background: oklch(0.098 0.008 285.823);  /* Near black */
  --foreground: oklch(0.985 0 0);            /* White */
  --primary: oklch(0.571 0.207 293.334);     /* Same purple (brand color) */
}
```

**Usage in Tailwind:**
```tsx
<div className="bg-background text-foreground">
  {/* Automatically switches based on .dark class */}
</div>
```

### Why OKLCH Color Space?

We use `oklch()` instead of traditional hex/rgb colors:

**Traditional colors (hex/rgb):**
```css
--primary: #8B5CF6;  /* Looks good */
--primary-hover: #7C3AED;  /* Manually calculated, might look off */
```

**OKLCH colors:**
```css
--primary: oklch(0.571 0.207 293.334);
/* L = 57.1% lightness, C = 20.7% chroma, H = 293° hue */

--primary-hover: oklch(0.5 0.207 293.334);
/* Just reduce lightness! Same hue, consistent brightness */
```

**Benefits:**
- ✅ Perceptually uniform (10% lighter actually looks 10% lighter)
- ✅ Consistent saturation across lightness changes
- ✅ Easier to generate color scales programmatically
- ✅ Better for accessibility (predictable contrast ratios)

---

## 🌙 Dark Mode Implementation

### How It Works

**1. Root layout sets dark class:**
```tsx
// apps/web/app/layout.tsx
<html lang="en" suppressHydrationWarning className="dark">
  {/* All children inherit dark mode */}
</html>
```

**2. CSS variables change:**
```css
/* globals.css */
:root {
  --background: oklch(1 0 0);  /* White in light mode */
}

.dark {
  --background: oklch(0.098 0.008 285.823);  /* Dark in dark mode */
}
```

**3. Components use variables:**
```tsx
<div className="bg-background">
  {/* Shows white in light mode, dark in dark mode */}
</div>
```

### Our Premium Dark Theme

**Color palette (from `globals.css`):**

```css
@theme inline {
  /* Background Colors */
  --color-bg-primary: #0A0A0F;      /* Deep space black */
  --color-bg-secondary: #13131A;    /* Card backgrounds */
  --color-bg-tertiary: #1A1A24;     /* Elevated surfaces */

  /* Text Colors */
  --color-text-primary: #F8F8F2;    /* High contrast white */
  --color-text-secondary: #A8A8B3;  /* Muted text */
  --color-text-tertiary: #6B6B76;   /* Disabled text */

  /* Accent Colors (Vibrant) */
  --color-accent-purple: #8B5CF6;
  --color-accent-cyan: #06B6D4;
  --color-accent-pink: #EC4899;
  --color-accent-amber: #F59E0B;
}
```

**Usage:**
```tsx
<div className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
  Premium dark mode!
</div>
```

### Theme Toggle (next-themes)

```tsx
// components/theme-provider.tsx (from our project)
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function Providers({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
```

**How it works:**
1. `attribute="class"` → Adds/removes `dark` class on `<html>`
2. `defaultTheme="dark"` → Starts in dark mode
3. `enableSystem` → Respects OS preference

---

## 📱 Responsive Design

### Mobile-First Approach

Tailwind uses **mobile-first** breakpoints:

| Breakpoint | Min Width | CSS Media Query |
|------------|-----------|-----------------|
| Default | 0px | (no prefix) |
| `sm:` | 640px | `@media (min-width: 640px)` |
| `md:` | 768px | `@media (min-width: 768px)` |
| `lg:` | 1024px | `@media (min-width: 1024px)` |
| `xl:` | 1280px | `@media (min-width: 1280px)` |
| `2xl:` | 1536px | `@media (min-width: 1536px)` |

### Example: Responsive Layout

```tsx
<div className="
  flex              // display: flex (all screens)
  flex-col          // flex-direction: column (mobile)
  gap-4             // gap: 1rem (all screens)
  md:flex-row       // flex-direction: row (tablet+)
  md:gap-6          // gap: 1.5rem (tablet+)
  lg:gap-8          // gap: 2rem (desktop+)
">
  {/* Stacks vertically on mobile, horizontally on tablet+ */}
</div>
```

### Fluid Typography

We use `clamp()` for fluid sizing:

```css
/* From globals.css */
--text-base*: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
/* min: 16px, scales with viewport, max: 18px */

--text-4xl*: clamp(2.25rem, 1.95rem + 1.5vw, 3rem);
/* min: 36px, scales with viewport, max: 48px */
```

**Usage:**
```tsx
<h1 className="text-[length:var(--text-4xl)]">
  Responsive heading (36-48px)
</h1>
```

Automatically scales between breakpoints, no media queries needed!

---

## 🎭 Custom Design Tokens

### Extending Tailwind

Our custom tokens are defined in `globals.css`:

```css
@theme inline {
  /* Custom shadows */
  --shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3);
  --shadow-glow-pink: 0 0 20px rgba(236, 72, 153, 0.3);
  
  /* Custom animations */
  --duration-instant: 150ms;
  --duration-fast: 300ms;
  --duration-normal: 500ms;
  
  /* Custom blur */
  --blur-md: 12px;
  --blur-lg: 20px;
}
```

**Usage in components:**
```tsx
<div className="
  shadow-[var(--shadow-glow-purple)]
  duration-[var(--duration-fast)]
  backdrop-blur-[var(--blur-lg)]
">
  Glowing glass card
</div>
```

### Glassmorphism Example

```tsx
// From our premium design system
<div className="glass-card">
  {/* Defined in globals.css */}
</div>
```

```css
.glass-card {
  position: relative;
  background-color: var(--color-glass-bg);    /* Semi-transparent */
  backdrop-filter: blur(var(--blur-lg));      /* 20px blur */
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-xl);
}
```

---

## ⚡ Performance Benefits

### 1. Tiny Production Builds

Tailwind **removes unused classes** in production:

**Development:**
```css
/* All of Tailwind (>3MB uncompressed) */
```

**Production:**
```css
/* Only classes you actually used (~10KB gzipped) */
.flex { display: flex; }
.items-center { align-items: center; }
.gap-4 { gap: 1rem; }
/* ... only 50 classes used */
```

### 2. No CSS Duplication

**Traditional CSS:**
```css
.button-primary { padding: 1rem; }
.button-secondary { padding: 1rem; }  /* Duplicated */
.card-header { padding: 1rem; }       /* Duplicated */
```

**Tailwind:**
```html
<button class="px-4">Primary</button>
<button class="px-4">Secondary</button>
<div class="px-4">Header</div>
```
`.px-4` defined once, used everywhere.

### 3. Faster Rendering

Utilities have **low specificity** (1 class = 1 selector):
```css
.px-4 { padding-left: 1rem; padding-right: 1rem; }
/* Specificity: 0,0,1,0 */
```

Traditional CSS often has high specificity:
```css
.card .header .title { font-size: 1.5rem; }
/* Specificity: 0,0,3,0 - harder for browser to calculate */
```

---

## 🌍 Our Tech vs Alternatives

### What We Use: Tailwind CSS 3.4.1

**Philosophy:** Utility-first CSS framework  
**Official Docs:** https://tailwindcss.com/docs

**Pros:**
- ✅ Tiny production builds (only used utilities)
- ✅ No naming CSS classes
- ✅ Styles colocated with markup
- ✅ Excellent DX (autocomplete, IntelliSense)
- ✅ Consistent design system via config

**Cons:**
- ❌ "Ugly" HTML (long className strings)
- ❌ Learning curve (memorize utility names)
- ❌ No visual separation of styles

**Best for:** Modern apps prioritizing speed and consistency

### Alternative 1: CSS Modules

**Philosophy:** Scoped CSS with standard syntax  
**Official Docs:** https://github.com/css-modules/css-modules

**Pros:**
- ✅ Familiar CSS syntax
- ✅ Automatic scope (no naming conflicts)
- ✅ Smaller HTML
- ✅ Visual separation (styles in separate file)

**Cons:**
- ❌ Still need to name things
- ❌ CSS files grow over time
- ❌ Context switching between files

**Example:**
```css
/* Button.module.css */
.button {
  background-color: purple;
  padding: 1rem;
}
```
```tsx
import styles from './Button.module.css';
<button className={styles.button}>Click</button>
```

**When to use:** You prefer traditional CSS workflows

### Alternative 2: Styled Components (CSS-in-JS)

**Philosophy:** CSS written in JavaScript  
**Official Docs:** https://styled-components.com

**Pros:**
- ✅ Dynamic styling with JS variables
- ✅ Automatic vendor prefixing
- ✅ Dead code elimination
- ✅ Themed components

**Cons:**
- ❌ Runtime performance cost
- ❌ Larger bundle size
- ❌ Doesn't work with React Server Components

**Example:**
```tsx
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${props => props.primary ? 'purple' : 'gray'};
  padding: 1rem;
`;

<Button primary>Click</Button>
```

**When to use:** You were - now superseded by CSS variables + Tailwind

### Alternative 3: Emotion

**Philosophy:** CSS-in-JS with performance focus  
**Official Docs:** https://emotion.sh

**Pros:**
- ✅ Faster than Styled Components
- ✅ Smaller bundle
- ✅ Flexible API (styled vs css prop)

**Cons:**
- ❌ Still runtime cost
- ❌ Complex with SSR
- ❌ React Server Components incompatible

**When to use:** Legacy projects, complex dynamic styling

### Alternative 4: Vanilla Extract

**Philosophy:** Zero-runtime CSS-in-TS  
**Official Docs:** https://vanilla-extract.style

**Pros:**
- ✅ TypeScript-first
- ✅ Zero runtime (extracted at build)
- ✅ Type-safe theming
- ✅ Works with RSC

**Cons:**
- ❌ More setup than Tailwind
- ❌ Still need to name styles
- ❌ Smaller ecosystem

**Example:**
```ts
// styles.css.ts
export const button = style({
  backgroundColor: 'purple',
  padding: '1rem',
});
```
```tsx
import { button } from './styles.css';
<button className={button}>Click</button>
```

**When to use:** Type-safe styling more important than utility-first

---

## 📊 Comparison Table

| Solution | Build Size | Runtime | DX | RSC Compatible | Learning Curve |
|----------|-----------|---------|-----|----------------|----------------|
| **Tailwind** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ |
| CSS Modules | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| Styled Comp | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ |
| Emotion | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ |
| Vanilla Extract | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ |

---

## 🤔 Reflection Questions

1. **Why utility-first instead of semantic CSS classes?**
   <details>
   <summary>Answer</summary>
   No naming things, no dead CSS, styles colocated with markup, consistent design system via utilities, smaller production builds.
   </details>

2. **What problem do CSS variables solve for theming?**
   <details>
   <summary>Answer</summary>
   Dynamic theme switching without duplicating styles. One className (`bg-background`) works in light and dark mode by changing variable values.
   </details>

3. **Why use OKLCH instead of hex/rgb colors?**
   <details>
   <summary>Answer</summary>
   Perceptually uniform (10% lighter looks 10% lighter), predictable contrast, easier to generate color scales, better accessibility.
   </details>

4. **How does Tailwind achieve tiny production builds?**
   <details>
   <summary>Answer</summary>
   Scans your code for used classes, removes unused utilities, generates minimal CSS with only what you actually use.
   </details>

5. **When would you choose Vanilla Extract over Tailwind?**
   <details>
   <summary>Answer</summary>
   When type-safety is critical, you want colocation AND scoping, or your team prefers writing TypeScript-style configs over learning utility names.
   </details>

---

## 🔗 Official Resources

- **Tailwind Docs:** https://tailwindcss.com/docs
- **OKLCH Color Picker:** https://oklch.com
- **next-themes Docs:** https://github.com/pacocoursey/next-themes
- **CSS Modules Docs:** https://github.com/css-modules/css-modules
- **Styled Components:** https://styled-components.com
- **Vanilla Extract:** https://vanilla-extract.style

---

## ✅ Key Takeaways

- Tailwind is **utility-first**: compose small classes instead of writing CSS
- **CSS variables** enable dynamic theming (light/dark) without duplicating code
- **OKLCH colors** provide perceptually uniform, accessible color systems
- **Mobile-first** responsive design starts small, enhances for larger screens
- **Tiny production builds** only include utilities you actually use
- Works perfectly with **React Server Components** (zero runtime)

---

**Next:** [05. tRPC + React Query →](./05-trpc-react-query.md)
