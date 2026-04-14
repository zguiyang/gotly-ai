# Phase 6 Coverage Gap Report

## 1. Uncovered Core Chains

### create chain
- **Status:** NOT COVERED at any layer
- **Gap:** No tests for asset creation flow (server/domain → application → action)
- **Risk:** HIGH - core business operation has no automated regression

### search chain  
- **Status:** PARTIAL at domain layer only
- **Gap:** Query parsing and ranking covered, but full search flow (query → rank → fallback → results) not integrated
- **Risk:** MEDIUM - individual components tested but integration path not verified

### todo chain
- **Status:** PARTIAL at domain layer only
- **Gap:** Todo review service tested, but completion flow (set-todo-completion) not covered
- **Risk:** MEDIUM - partial coverage leaves completion workflow untested

### summary chain
- **Status:** PARTIAL at domain layer
- **Gap:** notes.summary and bookmarks.summary covered, but no integration test verifying delegation from assets layer
- **Risk:** MEDIUM - individual domain services tested but orchestration not verified

### review chain
- **Status:** PARTIAL at domain layer
- **Gap:** todos.review.service tested, but no integration with assets layer
- **Risk:** MEDIUM - same as summary chain

---

## 2. Over-Testing / Redundant Tests

### assets.*.test.ts (6 files)
- **Issue:** These integration tests duplicate domain tests
- **Example:** `assets.note-summary.test.ts` re-tests what `notes.summary.service.test.ts` already covers
- **Redundancy:** 6 files with ~60% overlap with domain tests

### search-logging and search-time
- **Issue:** Test `.pure` helper files that don't exist (broken imports)
- **Status:** These tests are BROKEN and provide no value
- **Action:** Mark for removal or fix

---

## 3. High-Risk Unregressed Areas

| Area | Risk Level | Reason |
|------|------------|--------|
| Workspace creation | HIGH | No tests for create-workspace-asset flow |
| Todo completion | HIGH | set-todo-completion has no automated tests |
| Action auth | HIGH | No tests for unauthenticated/permission denied scenarios |
| Server action error mapping | MEDIUM | runServerAction error handling not fully tested |
| Search ranking integration | MEDIUM | Individual ranker tested but not full pipeline |
| Application layer orchestration | MEDIUM | No use-case integration tests |

---

## 4. Pre-existing Test Infrastructure Issues

### Module Resolution Failures
The following tests FAIL to run due to module resolution issues:
- `server/actions/__tests__/action-error.test.ts` - imports non-existent `action-error` module
- `server/actions/__tests__/run-server-action.test.ts` - imports non-existent `run-server-action` module  
- `server/assets/__tests__/assets.search-logging.test.ts` - imports non-existent `.pure` file
- `server/assets/__tests__/assets.search-time.test.ts` - imports non-existent `.pure` file
- `server/assets/__tests__/assets.summary-intent.test.ts` - imports non-existent `.pure` file

### @/server Alias Issue
Tests in `server/assets/__tests__/` fail with:
```
Cannot find package '@/server'
```

---

## 5. Summary

**Total test files:** 21
**Effectively runnable:** ~14 (66%)
**Covering core chains:** 0 of 5 complete
**Major gaps:** create chain, application layer, action contract testing

**Priority fixes:**
1. Fix broken imports in existing tests
2. Add application-layer integration tests (workspace use-cases)
3. Add action contract tests (auth, error shape)
4. Prune redundant assets/* tests
