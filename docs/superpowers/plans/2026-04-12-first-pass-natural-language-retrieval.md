# First-Pass Natural Language Retrieval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let query-like input in the workspace unified entry return relevant saved assets instead of showing the unsupported-query error.

**Architecture:** Keep this as a non-LLM MVP retrieval slice. Add a user-scoped search function in `server/assets/assets.service.ts`, return a typed created-or-query result from the existing `createWorkspaceAssetAction()`, and render query results inside `components/workspace/workspace-client.tsx` without adding an internal API route or new navigation route.

**Tech Stack:** Next.js App Router, Server Actions, Client Components, Drizzle ORM, PostgreSQL, Better Auth, TypeScript, sonner, pnpm.

---

## Source Context

- MVP route map: `docs/gotly-ai-mvp-next-steps.md`
- MVP PRD: `prd/gotly-ai-mvp-prd.md`
- Product PRD: `prd/gotly-ai-prd.md`
- Completed previous plans:
  - `docs/superpowers/plans/2026-04-12-real-asset-list-views.md`
  - `docs/superpowers/plans/2026-04-12-persist-todo-completion.md`
- Architecture rules: `.ai-rules/nextjs-fullstack-project-rules.md`
- Runtime rules: `.ai-rules/nextjs-runtime-and-boundaries-rules.md`
- Client state rules: `.ai-rules/react-client-state-and-forms-rules.md`
- Tooling rules: `.ai-rules/project-tooling-and-runtime-rules.md`
- Testing rules: `.ai-rules/testing-and-integration-rules.md`
- Next.js docs to read before code changes:
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
  - `node_modules/next/dist/docs/01-app/02-guides/data-security.md`

## Current State

- `server/assets/assets.classifier.ts` already detects obvious query intent and returns `{ kind: 'query' }`.
- `server/assets/assets.service.ts` currently turns query intent into `{ kind: 'query-not-supported' }`.
- `app/workspace/actions.ts` currently throws `ActionError('查询功能下一步接入...', 'QUERY_NOT_SUPPORTED')` for query-like input.
- `components/workspace/workspace-client.tsx` uses one input for save/query, but `handleSubmit()` only knows how to prepend a created asset to recent items.
- `/workspace/all` already has a visible `普通记录` filter tab, so the previous next-step item is effectively satisfied by the current code.
- The repository currently has no dedicated test runner script. Follow the testing rules: do not introduce broad test infrastructure in this slice unless the team explicitly chooses that first.

## In Scope

- Add a small non-LLM retrieval service over the current `assets` table.
- Match against `originalText`, `url`, `timeText`, and type labels/synonyms.
- Keep the query user-scoped with `assets.userId`.
- Return a small candidate list in the unified entry area.
- Show a clear empty state when nothing matches.
- Ensure query-like input is not accidentally saved as a new asset.
- Preserve the existing asset creation flow for notes, links, and todos.

## Out Of Scope

- Do not add embeddings, vector search, LLM summarization, AI SDK calls, or ranking through an external model.
- Do not add a new `app/api` route for internal page/action data.
- Do not add a separate `/workspace/search` or `/workspace/notes` route in this phase.
- Do not introduce new database tables, migrations, full-text indexes, or search infrastructure.
- Do not implement editing, deletion, link scraping, or webpage summarization.
- Do not redesign the workspace shell.
- Do not start Docker, Postgres, Redis, or the Next dev server without user approval.

## Proposed File Map

- Modify: `shared/assets/assets.types.ts`
  - Add a shared action result type for workspace submissions:
    - created asset result
    - query result with candidate assets
- Modify: `server/assets/assets.service.ts`
  - Add query term extraction and lightweight scoring helpers.
  - Add `searchAssets({ userId, query, limit })`.
  - Keep `createAsset()` behavior intact except for type compatibility if needed.
- Modify: `app/workspace/actions.ts`
  - Change `createWorkspaceAssetAction()` to return the new shared union type.
  - For `query-not-supported`, call `searchAssets()` and return `{ kind: 'query', query, results }` instead of throwing.
  - Keep `revalidatePath('/workspace')` only for created assets.
- Modify: `components/workspace/workspace-client.tsx`
  - Handle both created and query action results.
  - Render query results and no-result feedback above or near the existing recent-capture list.
  - Do not mutate `recentItems` for query results.

## Data Contracts

Add these types to `shared/assets/assets.types.ts`:

```ts
export type AssetQueryResult = {
  query: string
  results: AssetListItem[]
}

export type WorkspaceAssetActionResult =
  | { kind: 'created'; asset: AssetListItem }
  | { kind: 'query'; query: string; results: AssetListItem[] }
```

The client must branch on `result.kind`.

The server must never accept `userId` from the client for search. `createWorkspaceAssetAction()` must continue to call `requireUser()` and pass `user.id` into the service.

## Retrieval Design

Use a small in-process ranking pass over the user's latest assets. This is acceptable for the current MVP because the list limit is small, avoids premature database/search infrastructure, and is easy to replace later with full-text or semantic search.

Recommended behavior:

- Fetch up to 100 recent user assets with `where(eq(assets.userId, userId))`.
- Build normalized search terms by removing common Chinese query filler words.
- Score each candidate using these fields:
  - `originalText`
  - `url`
  - `timeText`
  - type labels and synonyms such as `普通记录`, `记录`, `想法`, `书签`, `链接`, `文章`, `收藏`, `待办`, `任务`, `事项`
- Sort by score descending, then by `createdAt` descending.
- Return the top 5 matches by default.

Example term extraction target:

```ts
getAssetSearchTerms('我最近记过关于定价的内容吗')
// ['定价']
```

Example query outcomes:

- `我最近记过关于定价的内容吗` returns notes or links whose text/url contains `定价`.
- `我上次收藏的 AI 文章在哪` should prefer link assets through `收藏`, `文章`, or `链接` hints, and match `AI` in text/url.
- `这周有什么待处理的事` should prefer todo assets through `待处理`, `待办`, `任务`, or `事项` hints, and match `本周`/`这周` when `timeText` is present.

## Task 0: Prepare Context

**Files:**

- Read: `AGENTS.md`
- Read: `.ai-rules/nextjs-fullstack-project-rules.md`
- Read: `.ai-rules/nextjs-runtime-and-boundaries-rules.md`
- Read: `.ai-rules/react-client-state-and-forms-rules.md`
- Read: `.ai-rules/project-tooling-and-runtime-rules.md`
- Read: `.ai-rules/testing-and-integration-rules.md`
- Read: `.agents/skills/next-best-practices/SKILL.md`
- Read: `.agents/skills/drizzle-orm/SKILL.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- Read: `node_modules/next/dist/docs/01-app/02-guides/data-security.md`

- [ ] **Step 1: Check working tree**

Run:

```bash
git status --short --untracked-files=all
```

Expected: Clean working tree or only unrelated user changes. Do not revert unrelated changes.

- [ ] **Step 2: Inspect the current query rejection path**

Run:

```bash
sed -n '1,220p' server/assets/assets.classifier.ts
sed -n '1,260p' server/assets/assets.service.ts
sed -n '1,220p' app/workspace/actions.ts
```

Expected: Query intent is detected in the classifier, then rejected through `query-not-supported` and `QUERY_NOT_SUPPORTED`.

- [ ] **Step 3: Inspect the current workspace client**

Run:

```bash
sed -n '1,320p' components/workspace/workspace-client.tsx
sed -n '1,160p' shared/assets/assets.types.ts
```

Expected: `WorkspaceClient` handles only an `AssetListItem` creation result and `AssetListItem` is the only shared asset UI type.

## Task 1: Add Shared Result Types

**Files:**

- Modify: `shared/assets/assets.types.ts`

- [ ] **Step 1: Add query and action result types**

Update `shared/assets/assets.types.ts`:

```ts
export type AssetQueryResult = {
  query: string
  results: AssetListItem[]
}

export type WorkspaceAssetActionResult =
  | { kind: 'created'; asset: AssetListItem }
  | { kind: 'query'; query: string; results: AssetListItem[] }
```

Expected: The file still contains only cross-runtime shared types, with no server-only imports.

- [ ] **Step 2: Run TypeScript check**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: No errors. This confirms the type addition did not introduce circular or runtime imports.

## Task 2: Add Lightweight Asset Search Service

**Files:**

- Modify: `server/assets/assets.service.ts`

- [ ] **Step 1: Add the search input type**

Near the existing local service types, add:

```ts
type SearchAssetsOptions = {
  userId: string
  query: string
  limit?: number
}
```

- [ ] **Step 2: Add query normalization helpers**

Add helpers near `clampAssetListLimit()`:

```ts
const QUERY_FILLERS = [
  '帮我',
  '找一下',
  '查一下',
  '我',
  '最近',
  '上次',
  '之前',
  '记过',
  '记录过',
  '关于',
  '内容',
  '在哪',
  '哪里',
  '有哪些',
  '什么',
  '一下',
  '的',
  '吗',
  '么',
]

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[，。！？、,.!?;；:：()[\]{}"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getAssetSearchTerms(query: string) {
  let normalized = normalizeSearchText(query)

  for (const filler of QUERY_FILLERS) {
    normalized = normalized.replaceAll(filler, ' ')
  }

  return Array.from(
    new Set(
      normalized
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 2)
    )
  ).slice(0, 8)
}
```

Reasoning: This turns `我最近记过关于定价的内容吗` into `定价` for the common MVP case without adding a tokenizer dependency.

- [ ] **Step 3: Add type hint helpers**

Add:

```ts
const ASSET_TYPE_TERMS: Record<AssetType, string[]> = {
  note: ['普通记录', '记录', '笔记', '想法', '文案'],
  link: ['书签', '链接', '文章', '收藏', '资料'],
  todo: ['待办', '待处理', '任务', '事项', '要做'],
}

function getTypeHintScore(query: string, type: AssetType) {
  return ASSET_TYPE_TERMS[type].some((term) => query.includes(term)) ? 2 : 0
}
```

Expected: These helpers stay local to the service and do not change the shared asset type.

- [ ] **Step 4: Add candidate scoring**

Add:

```ts
function scoreAssetForQuery(asset: Asset, query: string, terms: string[]) {
  const searchable = normalizeSearchText(
    [
      asset.originalText,
      asset.url,
      asset.timeText,
      ASSET_TYPE_TERMS[asset.type].join(' '),
    ]
      .filter(Boolean)
      .join(' ')
  )

  let score = getTypeHintScore(query, asset.type)

  for (const term of terms) {
    if (searchable.includes(term)) {
      score += term.length >= 4 ? 3 : 2
    }
  }

  if (query.includes('这周') && asset.timeText?.includes('本周')) {
    score += 2
  }

  return score
}
```

Expected: Scoring is deliberately simple and explainable. Do not add fuzzy matching or AI calls in this task.

- [ ] **Step 5: Add `searchAssets()`**

Add:

```ts
export async function searchAssets({
  userId,
  query,
  limit = 5,
}: SearchAssetsOptions): Promise<AssetListItem[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const terms = getAssetSearchTerms(trimmed)

  const rows = await db
    .select()
    .from(assets)
    .where(eq(assets.userId, userId))
    .orderBy(desc(assets.createdAt))
    .limit(100)

  return rows
    .map((asset) => ({
      asset,
      score: scoreAssetForQuery(asset, trimmed, terms),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.asset.createdAt.getTime() - a.asset.createdAt.getTime()
    })
    .slice(0, clampAssetListLimit(limit))
    .map((candidate) => toAssetListItem(candidate.asset))
}
```

Reasoning: The `where(eq(assets.userId, userId))` clause is the authorization boundary for retrieval. The 100-row candidate cap keeps this MVP path bounded until real search infrastructure exists.

- [ ] **Step 6: Run TypeScript check**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: No errors in `server/assets/assets.service.ts`.

## Task 3: Return Query Results From The Server Action

**Files:**

- Modify: `app/workspace/actions.ts`

- [ ] **Step 1: Import the search service and shared result type**

Update imports:

```ts
import {
  createAsset,
  searchAssets,
  setTodoCompletion,
  type AssetListItem,
} from '@/server/assets/assets.service'
import { type WorkspaceAssetActionResult } from '@/shared/assets/assets.types'
```

- [ ] **Step 2: Change the action return type**

Update the signature:

```ts
export async function createWorkspaceAssetAction(
  input: unknown
): Promise<WorkspaceAssetActionResult> {
```

- [ ] **Step 3: Return query results instead of throwing unsupported query**

Replace the existing `query-not-supported` branch:

```ts
if (result.kind === 'query-not-supported') {
  const results = await searchAssets({
    userId: user.id,
    query: trimmed,
    limit: 5,
  })

  return {
    kind: 'query',
    query: trimmed,
    results,
  }
}
```

Expected: Query input no longer calls `revalidatePath()` and no longer throws `QUERY_NOT_SUPPORTED`.

- [ ] **Step 4: Wrap created assets in the union result**

Update the create branch:

```ts
revalidatePath('/workspace')
return { kind: 'created', asset: result.asset }
```

Expected: Asset creation still revalidates the recent workspace page.

- [ ] **Step 5: Keep todo completion action unchanged**

Do not change `setTodoCompletionAction()` except for import formatting if needed.

- [ ] **Step 6: Note the temporary type boundary**

Do not commit after Task 3 alone. The Server Action return type changes before the client call site has been updated, so a type check can fail until Task 4 is complete.

Continue directly to Task 4, then run the full type check there:

```bash
pnpm exec tsc --noEmit
```

## Task 4: Render Query Results In The Workspace Client

**Files:**

- Modify: `components/workspace/workspace-client.tsx`

- [ ] **Step 1: Import the query result type**

Update the shared type import:

```ts
import {
  type AssetListItem,
  type AssetQueryResult,
} from '@/shared/assets/assets.types'
```

- [ ] **Step 2: Add query result state**

Inside `WorkspaceClient`, add:

```ts
const [queryResult, setQueryResult] = useState<AssetQueryResult | null>(null)
```

- [ ] **Step 3: Update submit result handling**

Change the Server Action handling in `handleSubmit()`:

```ts
const result = await callAction(() => createWorkspaceAssetAction(text), {
  loading: '处理中...',
  success: '已完成。',
  error: '处理失败，请重试。',
})

if (result.kind === 'created') {
  setRecentItems((items) => [result.asset, ...items].slice(0, 6))
  setQueryResult(null)
  setInputValue('')
  setStatus('success')
  return
}

setQueryResult({ query: result.query, results: result.results })
setStatus('success')
```

Expected: Query results do not update `recentItems` and do not create a new asset.

- [ ] **Step 4: Add a small query result renderer**

Add a local component below `RecentItem`:

```tsx
function QueryResults({
  query,
  results,
}: {
  query: string
  results: AssetListItem[]
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          查询结果
        </h2>
        <div className="flex-1 h-px bg-outline-variant/20" />
      </div>
      <p className="text-xs text-on-surface-variant/60 mb-3">
        {`“${query}”`}
      </p>
      {results.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          没有找到相关内容。换个关键词试试。
        </p>
      ) : (
        <div>
          {results.map((asset) => {
            const presentation = assetTypePresentation[asset.type]
            return (
              <RecentItem
                key={asset.id}
                icon={presentation.icon}
                iconBg={presentation.iconBg}
                iconColor={presentation.iconColor}
                title={asset.title}
                excerpt={asset.excerpt}
                time={formatAssetTime(new Date(asset.createdAt))}
                type={presentation.label}
                timeText={asset.timeText}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
```

Expected: This reuses the existing list item presentation instead of introducing a new card style.

- [ ] **Step 5: Render query results before recent captures**

In `WorkspaceClient` JSX, render the query result section after the input section and before the `最近捕获` section:

```tsx
{queryResult ? (
  <QueryResults query={queryResult.query} results={queryResult.results} />
) : null}
```

- [ ] **Step 6: Adjust helper copy**

Keep the existing input helper direction but make it accurate for both actions:

```tsx
输入后会保存到知识库，查询结果会出现在这里
```

If the current copy already matches this, do not change it.

- [ ] **Step 7: Run TypeScript check**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: No TypeScript errors.

## Task 5: Update Planning Context

**Files:**

- Modify: `docs/gotly-ai-mvp-next-steps.md`

- [ ] **Step 1: Mark todo completion completed**

Under `### 2. Persist Todo Completion`, add:

```md
**Status:** Completed on 2026-04-12.
```

- [ ] **Step 2: Mark ordinary notes exposure completed if current code still satisfies it**

Under `### 3. Expose Normal Notes Clearly`, add:

```md
**Status:** Completed on 2026-04-12 via the `普通记录` filter in `/workspace/all`.
```

Do not add an execution plan link for this item unless a dedicated plan file is created. The implementation was covered by the real asset list view/UI label work.

- [ ] **Step 3: Link this retrieval plan**

Under `### 4. First-Pass Natural Language Retrieval`, add:

```md
**Execution plan:** `docs/superpowers/plans/2026-04-12-first-pass-natural-language-retrieval.md`
```

- [ ] **Step 4: Update baseline wording**

In the current implemented baseline, remove stale wording that says `/workspace/todos` completion is read-only. Add wording that queries are the next open MVP gap.

Expected: Future sessions can see that the next executable work item is natural-language retrieval, not todo persistence or ordinary-note visibility.

## Task 6: Verification

**Files:**

- Verify: `shared/assets/assets.types.ts`
- Verify: `server/assets/assets.service.ts`
- Verify: `app/workspace/actions.ts`
- Verify: `components/workspace/workspace-client.tsx`
- Verify: `docs/gotly-ai-mvp-next-steps.md`

- [ ] **Step 1: Search for stale unsupported-query copy**

Run:

```bash
rg -n "QUERY_NOT_SUPPORTED|查询功能下一步接入|query-not-supported" app components server shared
```

Expected: `query-not-supported` may still exist inside the service result type/path if `createAsset()` still uses it internally, but user-facing `查询功能下一步接入` should no longer be thrown by the workspace action.

- [ ] **Step 2: Check server/client boundary**

Run:

```bash
rg -n "server/assets|server/db|server/auth|server-only|ioredis" components/workspace -g '*.tsx'
```

Expected: No direct server-only imports in Client Components. Importing `createWorkspaceAssetAction` from `app/workspace/actions.ts` remains acceptable because it is a Server Action.

- [ ] **Step 3: Run TypeScript**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: Exit code 0.

- [ ] **Step 4: Run lint**

Run:

```bash
pnpm lint
```

Expected: Exit code 0.

- [ ] **Step 5: Run diff whitespace check**

Run:

```bash
git diff --check
```

Expected: No trailing whitespace or conflict markers.

- [ ] **Step 6: Run production build outside the sandbox**

Run in the local environment, not the sandbox:

```bash
pnpm build
```

Expected: Next.js production build completes successfully.

Note: In this project, the build command is known to hang under sandbox execution. If using Codex tools, request escalated/local execution for `pnpm build`.

## Task 7: Manual Runtime Verification

**Files:**

- Verify behavior in the running app only if the user approves starting or using the dev server.

- [ ] **Step 1: Confirm service state**

If the app is not already running, ask before starting it. Do not start Next.js, Docker, Postgres, or Redis implicitly.

- [ ] **Step 2: Create or use seed assets**

Use the UI to save a few assets, for example:

```text
记一下首页定价文案可以偏轻管家感
https://example.com/ai-pricing 这篇 AI 定价文章后面看
本周待办：整理定价反馈
```

- [ ] **Step 3: Query a matching note**

Submit:

```text
我最近记过关于定价的内容吗
```

Expected: Query results render in the unified entry area and include at least one matching saved asset.

- [ ] **Step 4: Query a matching link**

Submit:

```text
我上次收藏的 AI 文章在哪
```

Expected: Results prefer link assets when relevant matches exist.

- [ ] **Step 5: Query matching todos**

Submit:

```text
这周有什么待处理的事
```

Expected: Results include relevant todo assets when relevant matches exist.

- [ ] **Step 6: Query no-result text**

Submit an intentionally unrelated query:

```text
有没有火星蔬菜种植记录
```

Expected: The UI shows `没有找到相关内容。换个关键词试试。` or equivalent clear empty feedback.

- [ ] **Step 7: Confirm query text was not saved**

Open `/workspace/all`.

Expected: Query text itself does not appear as a new saved asset.

## Commit Guidance

If committing this implementation as one logical change:

```bash
git add shared/assets/assets.types.ts server/assets/assets.service.ts app/workspace/actions.ts components/workspace/workspace-client.tsx
git add -f docs/gotly-ai-mvp-next-steps.md docs/superpowers/plans/2026-04-12-first-pass-natural-language-retrieval.md
git commit -m "feat(workspace): add first-pass asset retrieval"
```

If docs are intentionally not committed, omit the forced `docs/` add. `docs/` appears to be ignored in this repository, so use `git add -f` for plan files when they should be included.
