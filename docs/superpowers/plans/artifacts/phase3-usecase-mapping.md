# Phase 3: Workspace Action → Use-case Migration Mapping

## Architecture Overview

```
app/workspace/actions.ts (thin entry)
    ↓
server/application/workspace/*.use-case.ts (orchestration)
    ↓
server/assets/*.service.ts (domain logic)
```

## Action Inventory

### 1. createWorkspaceAssetAction

| Aspect | Detail |
|--------|--------|
| **Location** | `app/workspace/actions.ts:14-66` |
| **Current Responsibility** | Input validation, auth, branching orchestration (create/search/summary), revalidate |
| **Target Use-case** | `server/application/workspace/create-workspace-asset.use-case.ts` |

**Input:**
- `input: unknown` (raw user text)

**Output:**
- `Promise<WorkspaceAssetActionResult>`

**Branching Logic:**
```typescript
if (result.kind === 'search') → createAsset → searchAssets → return query result
if (result.kind === 'summary') {
  if (summaryTarget === 'unfinished_todos') → reviewUnfinishedTodos
  if (summaryTarget === 'recent_notes') → summarizeRecentNotes
  else → summarizeRecentBookmarks
}
if (result.kind === 'created') → createAsset → revalidate → return asset
```

**Migration Notes:**
- Keep `input` validation in action (empty string check)
- Move branching orchestration to use-case
- Move `requireUser()` call location TBD (action or use-case)
- Keep `revalidatePath('/workspace')` in action (Next.js runtime dependency)
- Error codes: `ACTION_ERROR_CODES.EMPTY_INPUT`

---

### 2. setTodoCompletionAction

| Aspect | Detail |
|--------|--------|
| **Location** | `app/workspace/actions.ts:90-113` |
| **Current Responsibility** | Input parsing, auth, domain call, revalidate |
| **Target Use-case** | `server/application/workspace/set-todo-completion.use-case.ts` |

**Input:**
- `input: unknown` → parsed to `{ assetId: string, completed: boolean }`

**Output:**
- `Promise<AssetListItem>`

**Helper:**
- `parseTodoCompletionInput()` (lines 68-88) - validates assetId is non-empty string, completed is boolean

**Migration Notes:**
- Validation helper stays in action layer (Phase 4 validator strategy)
- Move `setTodoCompletion()` call to use-case
- Keep revalidate paths in action: `/workspace`, `/workspace/all`, `/workspace/todos`
- Error codes: `ACTION_ERROR_CODES.INVALID_TODO_COMPLETION_INPUT`, `ACTION_ERROR_CODES.TODO_NOT_FOUND`

---

### 3. reviewUnfinishedTodosAction

| Aspect | Detail |
|--------|--------|
| **Location** | `app/workspace/actions.ts:115-121` |
| **Current Responsibility** | Auth, domain call |
| **Target Use-case** | `server/application/workspace/review-unfinished-todos.use-case.ts` |

**Input:**
- None

**Output:**
- `Promise<WorkspaceAssetActionResult>` → `{ kind: 'todo-review', review: TodoReviewResult }`

**Migration Notes:**
- Simple delegation: action → use-case → `reviewUnfinishedTodos(userId)`
- No revalidate needed (no data mutation)
- Keep `requireUser()` in action

---

### 4. summarizeRecentNotesAction

| Aspect | Detail |
|--------|--------|
| **Location** | `app/workspace/actions.ts:123-129` |
| **Current Responsibility** | Auth, domain call |
| **Target Use-case** | `server/application/workspace/summarize-recent-notes.use-case.ts` |

**Input:**
- None

**Output:**
- `Promise<WorkspaceAssetActionResult>` → `{ kind: 'note-summary', summary: NoteSummaryResult }`

**Migration Notes:**
- Simple delegation: action → use-case → `summarizeRecentNotes(userId)`
- No revalidate needed
- Keep `requireUser()` in action

---

### 5. summarizeRecentBookmarksAction

| Aspect | Detail |
|--------|--------|
| **Location** | `app/workspace/actions.ts:131-137` |
| **Current Responsibility** | Auth, domain call |
| **Target Use-case** | `server/application/workspace/summarize-recent-bookmarks.use-case.ts` |

**Input:**
- None

**Output:**
- `Promise<WorkspaceAssetActionResult>` → `{ kind: 'bookmark-summary', summary: BookmarkSummaryResult }`

**Migration Notes:**
- Simple delegation: action → use-case → `summarizeRecentBookmarks(userId)`
- No revalidate needed
- Keep `requireUser()` in action

---

## Shared Types (from `shared/assets/assets.types.ts`)

| Type | Used By |
|------|---------|
| `AssetListItem` | `setTodoCompletionAction` |
| `WorkspaceAssetActionResult` | `createWorkspaceAssetAction`, `reviewUnfinishedTodosAction`, `summarizeRecentNotesAction`, `summarizeRecentBookmarksAction` |
| `TodoReviewResult` | `reviewUnfinishedTodosAction` |
| `NoteSummaryResult` | `summarizeRecentNotesAction` |
| `BookmarkSummaryResult` | `summarizeRecentBookmarksAction` |

---

## Domain Services (Migration Targets)

| Service | Called By | Location |
|---------|-----------|----------|
| `createAsset({ userId, text })` | `createWorkspaceAssetAction` | `server/assets/assets.service.ts:348` |
| `searchAssets({ userId, query, typeHint, timeHint, completionHint, limit })` | `createWorkspaceAssetAction` | `server/assets/assets.service.ts:147` |
| `setTodoCompletion({ userId, assetId, completed })` | `setTodoCompletionAction` | `server/assets/assets.service.ts:446` |
| `reviewUnfinishedTodos(userId)` | `createWorkspaceAssetAction`, `reviewUnfinishedTodosAction` | `server/assets/assets.todo-review.ts:73` |
| `summarizeRecentNotes(userId)` | `createWorkspaceAssetAction`, `summarizeRecentNotesAction` | `server/assets/assets.note-summary.ts:75` |
| `summarizeRecentBookmarks(userId)` | `createWorkspaceAssetAction`, `summarizeRecentBookmarksAction` | `server/assets/assets.bookmark-summary.ts:77` |

---

## Migration Checklist

### createWorkspaceAssetAction
- [ ] Extract input validation (string type, non-empty after trim) → action
- [ ] Move `requireUser()` to action (pre-use-case)
- [ ] Move branching logic to `create-workspace-asset.use-case.ts`
- [ ] Keep `revalidatePath('/workspace')` in action
- [ ] Maintain return type `WorkspaceAssetActionResult`

### setTodoCompletionAction
- [ ] Keep `parseTodoCompletionInput()` in action (Phase 4 validator)
- [ ] Move `setTodoCompletion()` call to use-case
- [ ] Keep revalidate paths in action
- [ ] Maintain return type `AssetListItem`

### reviewUnfinishedTodosAction
- [ ] Simple redirect: action → use-case → `reviewUnfinishedTodos()`
- [ ] No revalidate needed

### summarizeRecentNotesAction
- [ ] Simple redirect: action → use-case → `summarizeRecentNotes()`
- [ ] No revalidate needed

### summarizeRecentBookmarksAction
- [ ] Simple redirect: action → use-case → `summarizeRecentBookmarks()`
- [ ] No revalidate needed

---

## Revalidate Path Summary

| Action | Revalidate Paths |
|--------|-----------------|
| `createWorkspaceAssetAction` | `/workspace` |
| `setTodoCompletionAction` | `/workspace`, `/workspace/all`, `/workspace/todos` |
| `reviewUnfinishedTodosAction` | (none) |
| `summarizeRecentNotesAction` | (none) |
| `summarizeRecentBookmarksAction` | (none) |

---

## Error Codes (from `server/actions/action-error.ts`)

| Code | Used In | Meaning |
|------|---------|---------|
| `EMPTY_INPUT` | `createWorkspaceAssetAction` | User submitted empty/whitespace-only text |
| `INVALID_TODO_COMPLETION_INPUT` | `setTodoCompletionAction` | Malformed input object |
| `TODO_NOT_FOUND` | `setTodoCompletionAction` | Asset not found or user lacks permission |

---

## Auth Pattern

All actions use `requireUser()` from `@/server/auth/session` to:
1. Verify session exists
2. Extract `user.id` for domain service calls

**Decision:** Keep `requireUser()` in action layer (session context is request-scoped, not testable in use-case isolation).
