# Phase 6 Test Inventory

## Test File Inventory

### server/ (19 test files)

| File | Domain | Layer | Coverage |
|------|--------|-------|----------|
| `server/actions/__tests__/action-error.test.ts` | Actions | action-contract | Error shape contract |
| `server/actions/__tests__/run-server-action.test.ts` | Actions | action-contract | Server action runner |
| `server/ai/__tests__/ai-fallback-policy.test.ts` | AI | domain | Fallback policy |
| `server/ai/__tests__/ai-runner.test.ts` | AI | domain | AI execution runner |
| `server/assets/__tests__/assets.bookmark-summary.test.ts` | Assets | integration | Bookmark summary delegation |
| `server/assets/__tests__/assets.note-summary.test.ts` | Assets | integration | Note summary delegation |
| `server/assets/__tests__/assets.search-logging.test.ts` | Assets | integration | Search logging |
| `server/assets/__tests__/assets.search-time.test.ts` | Assets | integration | Search timing |
| `server/assets/__tests__/assets.summary-intent.test.ts` | Assets | integration | Summary intent detection |
| `server/assets/__tests__/assets.todo-review.test.ts` | Assets | integration | Todo review delegation |
| `server/bookmarks/__tests__/bookmarks.summary.service.test.ts` | Bookmarks | domain | Bookmark summary service |
| `server/notes/__tests__/notes.summary.service.test.ts` | Notes | domain | Note summary service |
| `server/search/__tests__/assets-search.service.test.ts` | Search | domain | Asset search service |
| `server/search/__tests__/search.fallback-policy.test.ts` | Search | domain | Search fallback policy |
| `server/search/__tests__/search.query-parser.test.ts` | Search | domain | Query parsing |
| `server/search/__tests__/search.ranker.test.ts` | Search | domain | Result ranking |
| `server/todos/__tests__/todos.review.service.test.ts` | Todos | domain | Todo review service |

### components/ (2 test files)

| File | Domain | Layer | Coverage |
|------|--------|-------|----------|
| `components/actions/__tests__/call-action.test.ts` | Actions | action-contract | Client action caller |
| `components/workspace/__tests__/workspace-action-state.test.ts` | Workspace | action-contract | Workspace action state |

### shared/ (1 test file)

| File | Domain | Layer | Coverage |
|------|--------|-------|----------|
| `shared/assets/__tests__/asset-time-display.test.ts` | Shared | utility | Time display formatting |

---

## Chain Coverage Matrix

| Chain | Domain Layer | Application Layer | Action Contract Layer |
|-------|-------------|-------------------|----------------------|
| create | ❌ | ❌ | ❌ |
| search | ⚠️ partial | ❌ | ❌ |
| todo | ⚠️ partial | ❌ | ❌ |
| summary | ⚠️ notes/bookmarks | ❌ | ❌ |
| review | ⚠️ todos | ❌ | ❌ |

---

## Test Layer Distribution

```
domain (unit):          10 files (59%)
integration:             6 files (35%)
action-contract:         3 files (18%)
utility:                 1 file (6%)
```

**Note:** Some tests span multiple layers (integration tests also verify domain contracts)
