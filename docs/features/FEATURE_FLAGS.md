# Feature Flags System

A type-safe, modular feature flag system for gradual feature rollouts and safe deployments.

## Quick Start

### Server-side (tRPC/API)

```typescript
import { isFeatureEnabled } from '@repo/api'

// In a tRPC procedure
if (isFeatureEnabled('dark-mode-theme')) {
  // Feature is enabled
}

// With user context (for percentage rollouts)
if (isFeatureEnabled('ab-testing-framework', { userId: ctx.user.id })) {
  // User is in the test group
}
```

### Client-side (SolidJS)

```tsx
import { useFeatureFlag, FeatureGate } from '~/lib/feature-flags'

// Hook approach
function MyComponent() {
  const isDarkMode = useFeatureFlag('dark-mode-theme')
  return <div class={isDarkMode() ? 'dark' : 'light'}>Content</div>
}

// Component approach
function App() {
  return (
    <FeatureGate flag="analytics-dashboard" fallback={<p>Coming soon!</p>}>
      <AnalyticsDashboard />
    </FeatureGate>
  )
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Feature Flags                         │
├─────────────────────────────────────────────────────────┤
│  packages/api/src/lib/feature-flags.ts                  │
│  └─ Flag definitions, evaluation engine, types          │
├─────────────────────────────────────────────────────────┤
│  packages/api/src/routers/feature-flags.ts              │
│  └─ tRPC router for client access                       │
├─────────────────────────────────────────────────────────┤
│  apps/web/src/lib/feature-flags.tsx                     │
│  └─ SolidJS context, hooks, components                  │
└─────────────────────────────────────────────────────────┘
```

## Flag Types

| Type | Use Case | Example |
|------|----------|---------|
| `boolean` | Simple on/off | Dark mode toggle |
| `percentage` | Gradual rollout | 10% of users get new feature |
| `user-targeted` | Specific users | Beta testers only |

## Adding a New Flag

1. Add to `FEATURE_FLAGS` in `packages/api/src/lib/feature-flags.ts`:

```typescript
'my-new-feature': {
  type: 'boolean',
  description: 'Enable the amazing new feature',
  category: 'frontend',
  defaultValue: false,
  addedAt: '2024-01-15',
  environmentOverrides: {
    development: true,  // Always on in dev
  },
},
```

2. The flag is immediately available everywhere - fully type-safe!

## Available Flags

| Flag | Category | Description |
|------|----------|-------------|
| `realtime-websocket-updates` | infrastructure | Real-time updates via WebSocket |
| `ui-optimistic-updates` | ux | Optimistic UI for perceived performance |
| `api-rate-limiting` | backend | API rate limiting and throttling |
| `background-jobs-queue` | infrastructure | Background job processing |
| `pwa-offline-mode` | frontend | PWA with offline support |
| `analytics-dashboard` | frontend | Analytics charts and metrics |
| `undo-redo-system` | ux | Undo/redo with Command pattern |
| `keyboard-shortcuts` | ux | Keyboard shortcuts (Cmd+K) |
| `smart-notifications` | frontend | Browser push notifications |
| `dark-mode-theme` | ux | Dark mode theme switching |
| `reminder-templates` | frontend | Pre-defined reminder templates |
| `search-fuzzy-matching` | frontend | Fuzzy search for reminders |
| `multi-tenant-workspaces` | infrastructure | Multi-tenant architecture |
| `activity-audit-log` | backend | Activity feed and audit logging |
| `ab-testing-framework` | infrastructure | A/B testing framework |
| `api-versioning` | backend | API versioning support |

## Debug Panel

In development mode, a debug panel appears in the bottom-right corner:
- Toggle any flag on/off
- Overrides persist in localStorage
- Click "Clear" to reset all overrides

---

## Learning Guide

### Core Concepts

1. **Feature Flags vs Feature Toggles**
   - Feature flags: Control feature visibility
   - Kill switches: Emergency disable in production
   - Experiment flags: A/B testing
   - Ops flags: System behavior (rate limiting)

2. **Evaluation Strategies**
   - Static: Always on/off
   - Environment-based: Different per env
   - User-based: Specific users or cohorts
   - Percentage: Gradual rollout

3. **Best Practices**
   - Short-lived flags (remove after full rollout)
   - Clear naming conventions
   - Document flag purpose and owner
   - Test both flag states

### Design Patterns Used

| Pattern | Where Used | Purpose |
|---------|------------|---------|
| Strategy | Flag evaluation | Different evaluation logic per flag type |
| Context | SolidJS Provider | Global state access |
| Factory | `createFeatureGatedFn` | Create flag-aware functions |

---

## Exercises

### Exercise 1: Add a New Boolean Flag
**Goal**: Add a flag for a "compact view" mode

```typescript
// TODO: Add this flag to FEATURE_FLAGS
'ui-compact-view': {
  // Your implementation here
}
```

<details>
<summary>Solution</summary>

```typescript
'ui-compact-view': {
  type: 'boolean',
  description: 'Enable compact view mode for reminder list',
  category: 'ux',
  defaultValue: false,
  addedAt: '2024-01-15',
  environmentOverrides: {
    development: true,
  },
},
```
</details>

### Exercise 2: Implement Percentage Rollout
**Goal**: Create a flag that enables a feature for 25% of users

<details>
<summary>Hint</summary>

Use `type: 'percentage'` and set the percentage value.
</details>

### Exercise 3: Create a Feature-Gated Component
**Goal**: Create a component that only shows when `keyboard-shortcuts` is enabled

```tsx
// TODO: Implement KeyboardShortcutsHint component
function KeyboardShortcutsHint() {
  // Your implementation here
}
```

<details>
<summary>Solution</summary>

```tsx
import { FeatureGate } from '~/lib/feature-flags'

function KeyboardShortcutsHint() {
  return (
    <FeatureGate flag="keyboard-shortcuts">
      <div class="text-sm text-gray-500">
        Press Cmd+K for quick actions
      </div>
    </FeatureGate>
  )
}
```
</details>

### Exercise 4: Mock Component Challenge
**Goal**: Build a `FeatureFlagAdmin` component

Requirements:
1. List all flags with their current state
2. Allow toggling flags (using local overrides)
3. Show flag metadata (description, category)
4. Group flags by category

This is a more complex exercise - try building it yourself!

---

## API Reference

### Server Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `isFeatureEnabled` | `flagName, context?` | `boolean` | Check if flag is enabled |
| `getAllFlags` | `context?` | `Record<string, boolean>` | Get all flag values |
| `getFlagMetadata` | `flagName` | `FlagConfig` | Get flag configuration |
| `getFlagsByCategory` | - | `Record<Category, string[]>` | Group flags by category |

### Client Hooks

| Hook | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `useFeatureFlags` | - | `FeatureFlagsContextValue` | Full context access |
| `useFeatureFlag` | `flagName` | `() => boolean` | Single flag accessor |

### Client Components

| Component | Props | Description |
|-----------|-------|-------------|
| `FeatureGate` | `flag, children, fallback?` | Conditional rendering |
| `FeatureGateMultiple` | `flags, mode?, children, fallback?` | Multiple flag gate |
| `FeatureFlagsDebugPanel` | - | Development debug UI |
