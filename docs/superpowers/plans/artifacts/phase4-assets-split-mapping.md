# Phase 4 Assets Domain Split Mapping

## Overview

This document maps the current `server/assets`胖模块 to new domain directories.

## Mapping Table

### Domain: `assets` (Core Asset - stays in `server/assets`)

| Source File | Target File | Notes |
|-------------|-------------|-------|
| `assets.service.ts` | `server/assets/assets.service.ts` (refactor to thin) | Core asset CRUD, search orchestration |
| `assets.repository.ts` | `server/assets/assets.repository.ts` (new) | Data access layer |
| `assets.types.ts` | `server/assets/assets.types.ts` (new) | Shared asset types |
| `assets.index.ts` | `server/assets/index.ts` (new) | Re-export bridge |
| `assets.embedding.service.ts` | `server/assets/assets.embedding.service.ts` | Asset embedding |
| `assets.embedding-scheduler.ts` | `server/assets/assets.embedding-scheduler.ts` | Embedding scheduling |
| `assets.embedding-provider.ts` | `server/assets/assets.embedding-provider.ts` | Embedding provider config |
| `assets.embedding-config.ts` | `server/assets/assets.embedding-config.ts` | Embedding configuration |

### Domain: `notes` (New - `server/notes`)

| Source File | Target File | Notes |
|-------------|-------------|-------|
| `assets.note-summary.ts` | `server/notes/notes.summary.service.ts` | Note summary generation |
| `assets.note-summary.pure.ts` | `server/notes/notes.summary.pure.ts` | Pure note summary logic |
| `assets.note-summary.schema.ts` | `server/notes/notes.summary.schema.ts` | Note summary Zod schema |

### Domain: `todos` (New - `server/todos`)

| Source File | Target File | Notes |
|-------------|-------------|-------|
| `assets.todo-review.ts` | `server/todos/todos.review.service.ts` | Todo review logic |
| `assets.todo-review.pure.ts` | `server/todos/todos.review.pure.ts` | Pure todo review logic |
| `assets.todo-review.schema.ts` | `server/todos/todos.review.schema.ts` | Todo review Zod schema |

### Domain: `bookmarks` (New - `server/bookmarks`)

| Source File | Target File | Notes |
|-------------|-------------|-------|
| `assets.bookmark-summary.ts` | `server/bookmarks/bookmarks.summary.service.ts` | Bookmark summary |
| `assets.bookmark-summary.pure.ts` | `server/bookmarks/bookmarks.summary.pure.ts` | Pure bookmark summary |
| `assets.bookmark-summary.schema.ts` | `server/bookmarks/bookmarks.summary.schema.ts` | Bookmark summary Zod schema |

### Domain: `search` (New - `server/search`)

| Source File | Target File | Notes |
|-------------|-------------|-------|
| `assets.search-time.ts` | `server/search/search-time.ts` | Search time hint parsing |
| `assets.search-time.pure.ts` | `server/search/search-time.pure.ts` | Pure search time logic |
| `assets.search-logging.ts` | `server/search/search-logging.ts` | Search path logging |
| `assets.search-logging.pure.ts` | `server/search/search-logging.pure.ts` | Pure search logging |

### Domain: `ai` (New - `server/ai`)

| Source File | Target File | Notes |
|-------------|-------------|-------|
| `assets.ai-provider.ts` | `server/ai/ai-provider.ts` | AI provider configuration |
| `assets.ai.schema.ts` | `server/ai/ai-schema.ts` | AI input/output schemas |
| `assets.interpreter.ts` | `server/ai/ai-interpreter.ts` | User input interpretation |
| `assets.classifier.ts` | `server/ai/ai-classifier.ts` | Input classification (note/link/todo/query) |
| `assets.summary-intent.pure.ts` | `server/ai/ai-summary-intent.pure.ts` | Summary intent detection |
| `assets.time.ts` | `server/ai/ai-time-parser.ts` | Time text parsing for AI |

### Shared/Utility Files

| Source File | Target File | Notes |
|-------------|-------------|-------|
| `assets.time.ts` | `server/shared/assets-time.ts` | Time text parsing (used by multiple domains) |

## Migration Priority

1. **Phase 4-A (This phase)**: Search domain extraction
2. **Phase 4-B**: AI domain extraction
3. **Phase 4-C**: Notes/Todos/Bookmarks domain extraction
4. **Phase 5**: Asset core cleanup

## Compatibility Exports (Transition Period)

During migration, `server/assets/index.ts` will re-export new domain entries to maintain backward compatibility.

## Files with Cross-Domain Dependencies

- `assets.interpreter.ts` depends on: classifier, summary-intent, time, ai-provider, ai-schema
- `assets.service.ts` depends on: interpreter, search-time, search-logging, embedding-scheduler, embedding-service
- `assets.note-summary.ts` depends on: time
- `assets.todo-review.ts` depends on: time
- `assets.bookmark-summary.ts` depends on: time

## Migration Notes

- `assets.classifier.ts` is AI-related (classifies user input type) → goes to `ai` domain
- `assets.summary-intent.pure.ts` is AI-related (detects summary intent) → goes to `ai` domain
- `assets.time.ts` is shared utility → goes to `shared/` or stays in assets core
