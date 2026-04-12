# Gotly AI MVP Next Steps

> Last updated: 2026-04-12

This document records the next MVP work sequence so future sessions do not need to re-analyze the PRD, recent commits, and execution-plan docs from scratch.

## Source Context

- Product direction: `prd/gotly-ai-prd.md`
- MVP scope: `prd/gotly-ai-mvp-prd.md`
- Existing execution plans:
  - `docs/superpowers/plans/2026-04-11-asset-capture-mvp.md`
  - `docs/superpowers/plans/2026-04-11-lightweight-action-auth-error-handling.md`
  - `docs/superpowers/plans/2026-04-12-real-asset-list-views.md`
  - `docs/superpowers/plans/2026-04-12-persist-todo-completion.md`
  - `docs/workspace-static-ui-review-todos.md`
- Current implemented baseline:
  - Better Auth protects workspace routes.
  - `assets` table exists.
  - `/workspace` can save personal assets through a Server Action.
  - `/workspace` shows recent saved assets from real data.
  - Server Action auth/error handling and client toast handling are centralized.
  - `/workspace/all`, `/workspace/bookmarks`, and `/workspace/todos` render user-scoped data from the `assets` table.
  - `/workspace/todos` can persist todo completion state.
  - `/workspace/all` exposes a `普通记录` filter for normal notes.
  - Natural-language retrieval is the next open MVP gap in the unified workspace entry.

## Product Goal

The MVP goal remains:

> Users can give Gotly AI lightweight personal information through one input, and later confirm, browse, and retrieve it.

Do not expand into a heavy notes app, task board, knowledge base, browser plugin, push-notification system, or general chat product before this loop is complete.

## Recommended Work Order

### 1. Real Asset List Views

**Status:** Completed on 2026-04-12.

**Goal:** Saved assets should appear in the supporting workspace views instead of only on the `/workspace` recent-capture area.

**Scope:**

- Replace mock data on `/workspace/all`, `/workspace/bookmarks`, and `/workspace/todos` with user-scoped data from the `assets` table.
- Add server service functions for listing assets by type.
- Keep page files thin: Server Components fetch data, Client Components render and handle local UI state.
- Keep database access in `server/assets/`.

**Acceptance:**

- A saved note appears in `/workspace/all` and the note filter.
- A saved link appears in `/workspace/all` and `/workspace/bookmarks`.
- A saved todo appears in `/workspace/all` and `/workspace/todos`.
- Unauthenticated users do not receive private asset data.
- Mock data is removed from the production rendering path for these pages.

**Execution plan:** `docs/superpowers/plans/2026-04-12-real-asset-list-views.md`

### 2. Persist Todo Completion

**Status:** Completed on 2026-04-12.

**Goal:** Marking a todo as complete should update the database, not just local component state.

**Scope:**

- Add a server-side asset service function to update `assets.completedAt`.
- Add a Server Action for toggling todo completion.
- Use the existing `runServerAction()`, `requireUser()`, and `callAction()` helpers.
- Revalidate affected workspace paths after mutation.

**Acceptance:**

- Completing a todo persists after refresh.
- Reopening `/workspace/todos` shows the correct active/completed grouping.
- `/workspace/all` shows todo status consistently.
- Users cannot update another user's asset.

**Execution plan:** `docs/superpowers/plans/2026-04-12-persist-todo-completion.md`

### 3. Expose Normal Notes Clearly

**Status:** Completed on 2026-04-12 via the `普通记录` filter in `/workspace/all`.

**Goal:** The MVP's "普通记录" view should be visible without forcing users to infer it from "全部".

**Recommended first step:**

- Keep this lightweight by exposing a clear "普通记录" filter in `/workspace/all`.
- Avoid adding `/workspace/notes` until the product really needs a separate route.

**Acceptance:**

- Users can quickly browse saved normal notes.
- The UI uses the PRD term "普通记录" or an equally clear product label.
- No new navigation route is added unless the filter proves insufficient.

### 4. First-Pass Natural Language Retrieval

**Status:** Completed on 2026-04-12.

**Goal:** Query inputs should return relevant saved assets instead of being rejected as unsupported.

**Recommended first step:**

- Implement a non-LLM retrieval slice first.
- Use simple keyword matching against `originalText`, `url`, `timeText`, and type labels.
- Return a small candidate list in the unified entry area.
- Keep LLM-based retrieval and summarization for a later phase after the baseline retrieval loop works.

**Acceptance:**

- A query such as "最近记过关于定价的内容吗" returns matching saved records when they exist.
- No-result queries show a clear empty state.
- Query handling does not accidentally save query text as a new asset.

**Execution plan:** `docs/superpowers/plans/2026-04-12-first-pass-natural-language-retrieval.md`

### 5. Real-Data UI Pass

**Goal:** Polish the workspace UI after it is rendering real data.

**Scope:**

- Re-check empty states, loading states, accessibility labels, mobile layout, and copy.
- Use `docs/workspace-static-ui-review-todos.md` as the backlog, but re-prioritize based on real data behavior.

**Acceptance:**

- Workspace pages work at desktop and mobile widths without horizontal clipping.
- Empty states are deliberate for each filter/page.
- Icon-only controls have accessible labels.
- Copy does not imply non-MVP features such as cross-app capture, push notifications, or full task-board behavior.

**Execution plan:** `docs/superpowers/plans/2026-04-12-real-data-ui-pass.md`

## Non-Goals For The Next Few Steps

- Do not add AI summaries before retrieval works.
- Do not add full webpage scraping or content cleaning.
- Do not add browser extensions or cross-app import.
- Do not introduce a separate internal API layer for page data.
- Do not introduce a heavy action framework, tRPC, or global logging framework.
- Do not redesign the workspace shell unless a real-data UI issue requires it.

## Planning Rule

Each numbered item above should get its own execution plan before implementation. Keep plans small enough that another AI agent can execute them without needing to re-read the whole repository history.
