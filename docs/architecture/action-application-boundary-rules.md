# Action and Application Layer Boundary Rules

## Purpose

This document defines the responsibilities and boundaries between:
- **Server Actions** (`app/**/actions.ts`) - thin entry points
- **Application Use-Cases** (`server/application/<domain>/`) - orchestration layer

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  app/workspace/actions.ts (thin entry)                      │
│  - Input validation                                         │
│  - Authentication (requireUser)                            │
│  - runServerAction wrapper                                  │
│  - revalidatePath calls                                     │
│  - Delegates to use-cases                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  server/application/workspace/*.use-case.ts (orchestration)  │
│  - Business logic branching                                 │
│  - Domain service delegation                                │
│  - Error handling and translation                           │
│  - NO Next.js runtime API calls                            │
│  - NO dependencies on app/ layer                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  server/assets/*.service.ts (domain logic)                  │
│  - Pure domain business logic                              │
│  - Data access                                             │
│  - External integrations                                   │
└─────────────────────────────────────────────────────────────┘
```

## Action Entry Responsibilities

Server Actions should only contain:

1. **Input Validation**
   - Type checking (e.g., `typeof input !== 'string'`)
   - Format validation (e.g., non-empty after trim)
   - Delegating validation helpers (e.g., `parseTodoCompletionInput`)

2. **Authentication**
   - `requireUser()` call to get current user
   - Session validation

3. **Action Wrapper**
   - `runServerAction()` for logging and tracing

4. **Cache Invalidation**
   - `revalidatePath()` calls to invalidate Next.js cache

5. **Use-Case Delegation**
   - Call use-cases and return results

### Action Layer MUST NOT

- Call domain services directly (delegate to use-cases instead)
- Contain business logic branching (move to use-cases)
- Call `revalidatePath()` from use-cases (keep in actions)
- Import from `@/app` (would create circular dependency)

## Application Use-Case Responsibilities

Use-cases handle orchestration:

1. **Business Logic Branching**
   - `if/else` logic for different operation types
   - Search vs. create vs. summary routing

2. **Cross-Domain Coordination**
   - Calling multiple domain services in sequence
   - Aggregating results from different sources

3. **Error Handling**
   - Translating domain errors to action errors
   - Throwing `ActionError` with appropriate codes

### Use-Case MUST NOT

- Call `revalidatePath()` or other Next.js runtime APIs
- Import from `@/app` (would create circular dependency)
- Contain UI rendering logic
- Access request/session context directly (userId should be passed as input)

## Naming Conventions

### Use-Case Files

```
server/application/<domain>/
  <action>.use-case.ts       # e.g., create-workspace-asset.use-case.ts
  <domain>.types.ts          # e.g., workspace.types.ts
  index.ts                   # Unified exports
```

### Use-Case Functions

```typescript
// Input type: <ActionName>Input
export type CreateWorkspaceAssetInput = {
  userId: string
  text: string
}

// Output type: Use domain types or <ActionName>Output
export type CreateWorkspaceAssetOutput = WorkspaceAssetActionResult

// Use-case function
export async function createWorkspaceAssetUseCase(
  input: CreateWorkspaceAssetInput
): Promise<CreateWorkspaceAssetOutput> {
  // ...
}
```

## Input/Output Types

### Type Reuse Strategy

- **Prefer** reusing types from `shared/` for cross-runtime contracts
- **Prefer** defining use-case input/output types in `server/application/<domain>/<domain>.types.ts`
- **Avoid** duplicating domain service types in use-case layer

### Example

```typescript
// shared/assets/assets.types.ts - cross-runtime contract
export type WorkspaceAssetActionResult =
  | { kind: 'created'; asset: AssetListItem }
  | { kind: 'query'; query: string; results: AssetListItem[] }
  // ...

// server/application/workspace/workspace.types.ts - use-case types
export type CreateWorkspaceAssetInput = {
  userId: string
  text: string
}

export type { WorkspaceAssetActionResult } from '@/shared/assets/assets.types'
```

## Error Handling

### Action Errors

Errors thrown from use-cases should be `ActionError` with appropriate codes:

```typescript
// In use-case
if (!result) {
  throw new ActionError(
    '没有找到这条待办，或你没有权限更新它。',
    ACTION_ERROR_CODES.TODO_NOT_FOUND
  )
}
```

### Error Codes

| Code | Usage | Meaning |
|------|-------|---------|
| `EMPTY_INPUT` | createWorkspaceAssetAction | User submitted empty/whitespace-only text |
| `INVALID_TODO_COMPLETION_INPUT` | setTodoCompletionAction | Malformed input object |
| `TODO_NOT_FOUND` | setTodoCompletionAction | Asset not found or user lacks permission |

## Migration Checklist

When migrating business logic from actions to use-cases:

- [ ] Identify business logic branching in action
- [ ] Create or update use-case file in `server/application/<domain>/`
- [ ] Move branching logic to use-case
- [ ] Keep input validation in action
- [ ] Keep `requireUser()` in action
- [ ] Keep `revalidatePath()` in action
- [ ] Keep `runServerAction()` wrapper in action
- [ ] Verify return shape remains unchanged
- [ ] Verify dependency direction: action → use-case → domain service

## Anti-Patterns

### ❌ Action Calling Domain Service Directly

```typescript
// BAD - action contains business logic
export async function createAssetAction(input: unknown) {
  const result = await createAsset({ userId: user.id, text: input }) // domain service
  if (result.kind === 'search') {
    const results = await searchAssets(...) // more domain service
  }
}
```

### ✅ Action Delegating to Use-Case

```typescript
// GOOD - action is thin
export async function createAssetAction(input: unknown) {
  return runServerAction('workspace.createAsset', async () => {
    const user = await requireUser()
    // Only validation, delegation, and revalidate in action
    const result = await createWorkspaceAssetUseCase({ userId: user.id, text: input })
    revalidatePath('/workspace')
    return result
  })
}
```

### ❌ Use-Case Calling revalidatePath

```typescript
// BAD - use-case depends on Next.js runtime
export async function createWorkspaceAssetUseCase(input) {
  const result = await createAsset(input)
  revalidatePath('/workspace') // NO - this stays in action
  return result
}
```

## Testing Strategy

### Unit Testing Use-Cases

Use-cases can be tested with mocks of domain services:

```typescript
// Mock domain service
mock.module('@/server/assets/assets.service', {
  namedExports: {
    createAsset: mockCreateAsset,
    searchAssets: mockSearchAssets,
  },
})

// Test use-case
const result = await createWorkspaceAssetUseCase({
  userId: 'user-1',
  text: 'test',
})
```

Note: `mock.module` may have compatibility issues with tsx/ESM. See Task 6 for current technical limitations.

### Integration Testing Actions

Actions should be tested through integration tests that verify the full flow from action to use-case to domain service.

## See Also

- `.ai-rules/nextjs-runtime-and-boundaries-rules.md`
- `.ai-rules/nextjs-fullstack-project-rules.md`
- `docs/superpowers/plans/artifacts/phase3-usecase-mapping.md`