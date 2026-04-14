# Frontend Boundary Rules

> These rules define the frontend architecture boundaries for this Next.js project.

## Overview

The frontend follows a layered architecture where each layer has a specific responsibility:

```
components -> hooks -> client/actions -> app server actions
```

## Layer Responsibilities

### 1. Components (`components/`)

Components are UI building blocks that only handle rendering and event binding.

**Allowed:**
- JSX markup and styling
- Props handling
- Event handlers that delegate to hooks
- Local UI state (e.g., `useState` for uncontrolled inputs)

**Prohibited:**
- Direct imports from `app/**/actions`
- State machine implementation
- Server action call orchestration
- Business logic beyond UI rendering

### 2. Hooks (`hooks/`)

Hooks contain state management, state machines, and async orchestration logic.

**Allowed:**
- State machines and state transitions
- Async action orchestration
- Business logic coordination
- Integration with client action adapters

**Prohibited:**
- Direct JSX rendering (delegate to components)
- Importing from `components/` (hooks are higher-level)

### 3. Client Actions (`client/actions/`)

Client actions are thin wrappers around server actions that may add client-side concerns.

**Allowed:**
- Wrapper functions around server actions
- Type export from server action types
- Client-side toast/integration (via `client/feedback/`)

**Prohibited:**
- Business logic (belongs in hooks or server)
- Direct database access

### 4. Client Feedback (`client/feedback/`)

Client feedback contains UI feedback mechanisms like toast notifications.

**Examples:**
- `toast-action.ts` - wraps actions with Sonner toast notifications

### 5. Config (`config/`)

Config contains frontend UI configuration that is centralized for consistency.

**Allowed:**
- Navigation items and active state logic
- Filter definitions
- Asset type presentation config
- UI constants and display values

## Migration Pattern

When migrating existing code to follow these boundaries:

1. **Identify跨界依赖**: Find direct imports from `app/**/actions` in components
2. **Create hooks**: Extract state machine and orchestration logic into `hooks/<domain>/`
3. **Create client adapters**: Wrap server actions in `client/actions/`
4. **Update components**: Replace direct action calls with hook usage
5. **Clean up transitional files**: Remove re-exports once all consumers are updated

## Example Migration

### Before (in component):
```tsx
// components/workspace/workspace-client.tsx
import { createWorkspaceAssetAction } from '@/app/workspace/actions'

async function handleSubmit() {
  setState('submitting')
  try {
    const result = await callAction(() => createWorkspaceAssetAction(text))
    setState(result)
  } catch (error) {
    setError(error)
  }
}
```

### After (in hook):
```tsx
// hooks/workspace/use-workspace-submit.ts
export function useWorkspaceSubmit() {
  const [state, setState] = useState(initialState)
  
  async function submit(input: string) {
    setState(toSubmitting(state))
    try {
      const result = await callAction(() => createWorkspaceAsset(input))
      setState(applyResult(state, result))
    } catch (error) {
      setState(toError(state, error.message))
    }
  }
  
  return { state, submit }
}
```

### After (in component):
```tsx
// components/workspace/workspace-client.tsx
import { useWorkspaceSubmit } from '@/hooks/workspace/use-workspace-submit'

function WorkspaceClient() {
  const { state, submit } = useWorkspaceSubmit()
  // Only UI code
}
```

## Validation Commands

Check for violations:

```bash
# Check for direct app action imports in components
rg -n "from '@/app/.*/actions'" components

# Check for config definitions in components (should only import, not define)
rg -n "export.*workspaceNavItems|export.*filterTabs" components
```

## References

- `.ai-rules/nextjs-fullstack-project-rules.md` - Core architectural rules
- `.ai-rules/react-client-state-and-forms-rules.md` - React patterns and hook organization
