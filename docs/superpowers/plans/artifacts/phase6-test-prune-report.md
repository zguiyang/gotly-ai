# Phase 6 Test Prune Report

## Tests Marked for Removal

### Broken Tests (Module Resolution Failures)

| File | Issue | Recommendation |
|------|-------|----------------|
| `server/assets/__tests__/assets.search-logging.test.ts` | Imports non-existent `.pure` file | DELETE |
| `server/assets/__tests__/assets.search-time.test.ts` | Imports non-existent `.pure` file | DELETE |
| `server/assets/__tests__/assets.summary-intent.test.ts` | Imports non-existent `.pure` file | DELETE |

### Redundant Tests (Duplicating Domain Tests)

| File | Overlapping With | Redundancy Reason | Recommendation |
|------|-----------------|-------------------|----------------|
| `server/assets/__tests__/assets.bookmark-summary.test.ts` | `server/bookmarks/__tests__/bookmarks.summary.service.test.ts` | Same coverage at assets layer | KEEP in assets (thin wrapper) or DELETE |
| `server/assets/__tests__/assets.note-summary.test.ts` | `server/notes/__tests__/notes.summary.service.test.ts` | Same coverage at assets layer | KEEP in assets (thin wrapper) or DELETE |
| `server/assets/__tests__/assets.todo-review.test.ts` | `server/todos/__tests__/todos.review.service.test.ts` | Same coverage at assets layer | KEEP in assets (thin wrapper) or DELETE |

## Deletion Criteria Verification

For tests to be deleted, ALL must be true:
1. ✅ New domain tests cover same input/output contract
2. ✅ Old test only verifies delegation/wrapper behavior  
3. ❌ Cannot verify deletion without running `pnpm run test:critical`

## Broken Tests to Delete

The following tests are BROKEN and provide no regression value:
- `server/assets/__tests__/assets.search-logging.test.ts`
- `server/assets/__tests__/assets.search-time.test.ts`  
- `server/assets/__tests__/assets.summary-intent.test.ts`

## Decision

**Phase 7 should handle the actual deletion** after:
1. Test infrastructure is fixed (env vars, path aliases)
2. Full `test:critical` can be run to verify deletion safety
