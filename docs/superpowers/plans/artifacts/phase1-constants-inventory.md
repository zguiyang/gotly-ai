# Phase 1 Constants Inventory Baseline

> Generated: 2026-04-14
> Purpose: Centralized constants governance baseline

## 1. Embedding/Search Constants

| Constant | Canonical Source | Duplicates | Target Layer |
|----------|-----------------|------------|--------------|
| `ASSET_EMBEDDING_TIMEOUT_MS` | `server/assets/assets.embedding-config.ts:5` | - | server/config |
| `ASSET_EMBEDDING_MAX_COSINE_DISTANCE` | `server/assets/assets.embedding-config.ts:7` | - | server/config |
| `ASSET_EMBEDDING_CANDIDATE_MULTIPLIER` | `server/assets/assets.embedding-config.ts:9` | - | server/config |
| `ASSET_EMBEDDING_DIMENSIONS` | `server/db/schema.ts:64` | - | server/config |

## 2. Summary/Review Constants

| Constant | Canonical Source | Duplicates | Target Layer |
|----------|-----------------|------------|--------------|
| `TODO_REVIEW_LIMIT` | `server/assets/assets.todo-review.ts:19` | `server/assets/assets.todo-review.pure.ts:14` | server/config |
| `NOTE_SUMMARY_LIMIT` | `server/assets/assets.note-summary.pure.ts:9` | `server/assets/assets.bookmark-summary.pure.ts:10` (same value 10, diff name) | server/config |
| `BOOKMARK_SUMMARY_LIMIT` | `server/assets/assets.bookmark-summary.pure.ts:10` | - | server/config |

## 3. Timeout Constants

| Constant | Canonical Source | Duplicates | Target Layer |
|----------|-----------------|------------|--------------|
| `TODO_REVIEW_MODEL_TIMEOUT_MS` | `server/assets/assets.todo-review.ts:18` | - | server/config |
| `NOTE_SUMMARY_MODEL_TIMEOUT_MS` | `server/assets/assets.note-summary.ts:21` | - | server/config |
| `BOOKMARK_SUMMARY_MODEL_TIMEOUT_MS` | `server/assets/assets.bookmark-summary.ts:21` | - | server/config |
| `ASSET_INPUT_MODEL_TIMEOUT_MS` | `server/assets/assets.interpreter.ts:20` | - | server/config |

## 4. Time Zone Constants

| Constant | Canonical Source | Duplicates | Target Layer |
|----------|-----------------|------------|--------------|
| `ASSET_TIME_ZONE` | `server/assets/assets.time.ts:3` | - | server/config/time |
| `ASSET_INPUT_TIME_ZONE` | `server/assets/assets.interpreter.ts:21` | Same value 'Asia/Shanghai' | server/config/time |

## 5. Frontend UI Config Constants

| Constant | Canonical Source | Duplicates | Target Layer |
|----------|-----------------|------------|--------------|
| `assetTypePresentation` | `components/workspace/all-client.tsx:63` | `components/workspace/workspace-result-panels.tsx:59` | config/ui |
| `filterTabs` | `components/workspace/all-client.tsx:25` | - | config/workspace |
| `groupLabels` | `components/workspace/todos-client.tsx:12` | - | config/workspace |
| `workspaceNavItems` | `components/workspace/nav-config.ts` | - | config/workspace |

## 6. Duplicate Analysis

### Critical Duplicates (Must Consolidate)

1. **TODO_REVIEW_LIMIT**: Defined in both `assets.todo-review.ts:19` and `assets.todo-review.pure.ts:14`
   - Resolution: Keep in `server/config/constants.ts`, pure file imports from service

2. **assetTypePresentation**: Defined in `all-client.tsx:63` AND `workspace-result-panels.tsx:59`
   - Resolution: Move to `config/ui/asset-presentation.ts`

3. **ASSET_TIME_ZONE vs ASSET_INPUT_TIME_ZONE**: Both = 'Asia/Shanghai'
   - Resolution: Unify to single `ASIA_SHANGHAI_TIME_ZONE` in `server/config/time.ts`

## 7. Magic Numbers to Replace

| Location | Magic Number | Should Be |
|----------|-------------|-----------|
| `assets.embedding.service.ts:171` | `clampedLimit * ASSET_EMBEDDING_CANDIDATE_MULTIPLIER` | Already uses constant |
| `assets.note-summary.pure.ts:14` | `notes.slice(0, NOTE_SUMMARY_LIMIT)` | Already uses constant |
| `assets.bookmark-summary.pure.ts:15` | `bookmarks.slice(0, BOOKMARK_SUMMARY_LIMIT)` | Already uses constant |

## 8. Files Requiring Modification

### Server Files
- `server/assets/assets.embedding-config.ts` → migrate to `server/config/`
- `server/assets/assets.embedding.service.ts` → import from `server/config/constants.ts`
- `server/assets/assets.todo-review.ts` → import from `server/config/constants.ts`
- `server/assets/assets.todo-review.pure.ts` → import from `server/config/constants.ts`
- `server/assets/assets.note-summary.ts` → import from `server/config/constants.ts`
- `server/assets/assets.note-summary.pure.ts` → import from `server/config/constants.ts`
- `server/assets/assets.bookmark-summary.ts` → import from `server/config/constants.ts`
- `server/assets/assets.bookmark-summary.pure.ts` → import from `server/config/constants.ts`
- `server/assets/assets.interpreter.ts` → import from `server/config/time.ts`
- `server/assets/assets.time.ts` → consolidate to `server/config/time.ts`

### Frontend Files
- `components/workspace/all-client.tsx` → import from `config/`
- `components/workspace/workspace-result-panels.tsx` → import from `config/`
- `components/workspace/todos-client.tsx` → import from `config/workspace`
- `components/workspace/nav-config.ts` → verify and consolidate
- `components/workspace/sidebar.tsx` → verify
- `components/workspace/top-app-bar.tsx` → verify
