# Phase Execution Protocol

> This document defines the mandatory execution protocol for all phase plans. AI agents must follow this protocol without exception.

## 1. Scope

This protocol applies to all phase plans in `docs/superpowers/plans/` and any feature/hotfix work following the phase model.

## 2. Phase Plan Metadata

Every phase plan document MUST include:

```yaml
phase_id: <unique-phase-identifier>
depends_on: [<phase-id>, ...]  # or [] if no dependencies
parallel_safe: true|false
base_branch_rule: Must start from latest main
branch_naming_rule: feat/${phase_id}
worktree_naming_rule: .worktrees/${phase_id}
failure_report_path: docs/superpowers/plans/artifacts/${phase_id}-failure-report.md
merge_strategy: PR-only
```

## 3. Execution Gates

All phase plans must pass these gates in order:

### 3.1 Preflight Gate (Before Starting)

**Purpose**: Verify all dependencies are satisfied.

```bash
git fetch --all --prune
git checkout main && git pull --ff-only
# Check dependency exists:
git show-ref --verify --quiet refs/remotes/origin/feat/${depends_on}
git merge-base --is-ancestor origin/${depends_on} origin/main
```

**Fail-Fast**: If dependency check fails, STOP immediately.

### 3.2 Start Gate (Before Development)

**Purpose**: Verify isolated workspace is set up correctly.

```bash
git branch --show-current  # Should be feat/${phase_id}
git merge-base --is-ancestor origin/main HEAD && echo "base-ok"
```

**Fail-Fast**: If baseline check fails, STOP immediately.

### 3.3 Sync Gate (Before Merge)

**Purpose**: Ensure branch is rebased on latest main.

```bash
git fetch --all --prune
git rebase origin/main
pnpm lint
pnpm run guard:all
```

**Fail-Fast**: If any check fails, STOP immediately.

### 3.4 PR Merge Gate

```bash
gh pr create --base main --head feat/${phase_id}
gh pr merge --squash --auto
```

**Required**: PR-only merge (no direct merge to main).

## 4. Fail-Fast Rule

Applies to all gates. On failure:
1. Stop all execution immediately
2. Generate failure report at `${failure_report_path}`
3. Wait for user confirmation before resuming

## 5. Worktree Setup

```bash
git fetch --all --prune
git checkout main && git pull --ff-only
git worktree add .worktrees/${phase_id} -b feat/${phase_id}
cd .worktrees/${phase_id}
```

## 6. Parallel Execution

| Flag | Meaning |
|------|---------|
| `parallel_safe: true` | Can run concurrently with other phases |
| `parallel_safe: false` | Must run alone; waits for dependencies |

## 7. Related Rules

- Layered architecture boundaries: `.ai-rules/nextjs-fullstack-project-rules.md` Section 9
- Test minimum contract: `.ai-rules/testing-and-integration-rules.md` Section 12.6
