# Phase 3: Application Layer & Thin Server Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 引入 `server/application/workspace` 用例层，让 `app/workspace/actions.ts` 变薄，仅保留 action 入口、参数校验、鉴权和 revalidate。  
**Architecture:** 建立 `app server actions -> application use-cases -> domain services(server/assets/...)` 的单向链路。先“包一层再迁移逻辑”，保持行为不变。  
**Tech Stack:** Next.js 16 Server Actions, TypeScript, Drizzle, Node test, ESLint

---

### Task 1: Build use-case migration map

**Files:**
- Create: `docs/superpowers/plans/artifacts/phase3-usecase-mapping.md`
- Modify: `docs/superpowers/plans/2026-04-14-phase-3-application-layer-thinning-actions-plan.md`

- [x] **Step 1: 扫描当前 action 职责**
Run: `nl -ba app/workspace/actions.ts | sed -n '1,260p'`
Expected: 明确每个 action 的编排逻辑边界

- [x] **Step 2: 建立映射表**
在 `phase3-usecase-mapping.md` 记录：
1) 现有 action 函数  
2) 目标 use-case 文件  
3) 输入输出类型  
4) 迁移注意事项（revalidate、错误码、鉴权）

- [x] **Step 3: Commit**
Run:
`git add docs/superpowers/plans/artifacts/phase3-usecase-mapping.md docs/superpowers/plans/2026-04-14-phase-3-application-layer-thinning-actions-plan.md`
`git commit -m "docs(plan): add phase3 use-case migration mapping"`

---

### Task 2: Scaffold application workspace layer

**Files:**
- Create: `server/application/workspace/workspace.types.ts`
- Create: `server/application/workspace/create-workspace-asset.use-case.ts`
- Create: `server/application/workspace/set-todo-completion.use-case.ts`
- Create: `server/application/workspace/review-unfinished-todos.use-case.ts`
- Create: `server/application/workspace/summarize-recent-notes.use-case.ts`
- Create: `server/application/workspace/summarize-recent-bookmarks.use-case.ts`
- Create: `server/application/workspace/index.ts`

- [ ] **Step 1: 新建 workspace types**
在 `workspace.types.ts` 定义 use-case 级输入输出（复用 `shared/assets/assets.types`，避免重复造型）。

- [ ] **Step 2: 创建 5 个 use-case 文件骨架**
先写最小函数签名和 `TODO` 占位，实现先返回/委托现有服务。

- [ ] **Step 3: 新建 index 导出**
统一导出 use-cases，供 `app/workspace/actions.ts` 引用。

- [ ] **Step 4: Commit**
Run:
`git add server/application/workspace/workspace.types.ts server/application/workspace/create-workspace-asset.use-case.ts server/application/workspace/set-todo-completion.use-case.ts server/application/workspace/review-unfinished-todos.use-case.ts server/application/workspace/summarize-recent-notes.use-case.ts server/application/workspace/summarize-recent-bookmarks.use-case.ts server/application/workspace/index.ts`
`git commit -m "refactor(application): scaffold workspace use-case layer"`

---

### Task 3: Migrate createWorkspaceAssetAction orchestration

**Files:**
- Modify: `server/application/workspace/create-workspace-asset.use-case.ts`
- Modify: `app/workspace/actions.ts`

- [ ] **Step 1: 迁移 create + search + summary 编排**
将 `createWorkspaceAssetAction` 中的业务分支编排（create/search/summary）迁移到 `create-workspace-asset.use-case.ts`。

- [ ] **Step 2: action 层保持薄入口**
`app/workspace/actions.ts` 仅保留：
- 输入基础校验
- `requireUser()`
- `runServerAction(...)`
- `revalidatePath(...)`
- 调用 use-case

- [ ] **Step 3: 行为等价检查**
确保返回 shape 不变（`WorkspaceAssetActionResult`）。

- [ ] **Step 4: Commit**
Run:
`git add server/application/workspace/create-workspace-asset.use-case.ts app/workspace/actions.ts`
`git commit -m "refactor(application): move workspace create/search/summary orchestration to use-case"`

---

### Task 4: Migrate todo completion flow

**Files:**
- Modify: `server/application/workspace/set-todo-completion.use-case.ts`
- Modify: `app/workspace/actions.ts`

- [ ] **Step 1: 迁移 setTodoCompletion 业务逻辑**
将待办更新与未找到分支处理迁入 use-case。

- [ ] **Step 2: 保留 action 输入校验位置**
`parseTodoCompletionInput` 可暂留 action 层（Phase 4 再下沉/统一 validator），本阶段目标是 action 变薄，不强制重写校验策略。

- [ ] **Step 3: 保留 revalidate 在 action 层**
继续由 action 决定 revalidate path，避免 use-case 绑定 Next.js runtime API。

- [ ] **Step 4: Commit**
Run:
`git add server/application/workspace/set-todo-completion.use-case.ts app/workspace/actions.ts`
`git commit -m "refactor(application): move todo completion logic into workspace use-case"`

---

### Task 5: Migrate independent summary/review actions

**Files:**
- Modify: `server/application/workspace/review-unfinished-todos.use-case.ts`
- Modify: `server/application/workspace/summarize-recent-notes.use-case.ts`
- Modify: `server/application/workspace/summarize-recent-bookmarks.use-case.ts`
- Modify: `app/workspace/actions.ts`

- [ ] **Step 1: 迁移 reviewUnfinishedTodosAction 业务调用**
改为 action 入口 -> use-case -> domain service。

- [ ] **Step 2: 迁移 summarizeRecentNotesAction 业务调用**
改为 action 入口 -> use-case -> domain service。

- [ ] **Step 3: 迁移 summarizeRecentBookmarksAction 业务调用**
改为 action 入口 -> use-case -> domain service。

- [ ] **Step 4: Commit**
Run:
`git add server/application/workspace/review-unfinished-todos.use-case.ts server/application/workspace/summarize-recent-notes.use-case.ts server/application/workspace/summarize-recent-bookmarks.use-case.ts app/workspace/actions.ts`
`git commit -m "refactor(application): route summary and review actions through workspace use-cases"`

---

### Task 6: Add application-layer tests (contract-focused)

**Files:**
- Create: `server/application/workspace/__tests__/create-workspace-asset.use-case.test.ts`
- Create: `server/application/workspace/__tests__/set-todo-completion.use-case.test.ts`
- Create: `server/application/workspace/__tests__/workspace-summary.use-cases.test.ts`
- Modify: `server/actions/__tests__/run-server-action.test.ts` (必要时)

- [ ] **Step 1: 为 create use-case 写测试**
覆盖：
- create 分支
- search 分支
- summary 分支

- [ ] **Step 2: 为 setTodoCompletion use-case 写测试**
覆盖：
- 更新成功
- 找不到 todo

- [ ] **Step 3: 为 summary/review use-cases 写测试**
覆盖返回 shape 与委托路径（mock domain services）。

- [ ] **Step 4: 运行新增测试**
Run: `node --test server/application/workspace/__tests__/*.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
Run:
`git add server/application/workspace/__tests__/create-workspace-asset.use-case.test.ts server/application/workspace/__tests__/set-todo-completion.use-case.test.ts server/application/workspace/__tests__/workspace-summary.use-cases.test.ts server/actions/__tests__/run-server-action.test.ts`
`git commit -m "test(application): add workspace use-case contract tests"`

---

### Task 7: Verify thin action boundaries and imports

**Files:**
- Create: `docs/superpowers/plans/artifacts/phase3-verification-report.md`

- [ ] **Step 1: 检查 actions 文件体量与职责**
Run:
- `wc -l app/workspace/actions.ts`
- `rg -n "createAsset\\(|searchAssets\\(|reviewUnfinishedTodos\\(|summarizeRecentNotes\\(|summarizeRecentBookmarks\\(" app/workspace/actions.ts`

Expected:
- action 文件仅保留薄编排（允许少量校验与 revalidate）
- 大部分业务调用已通过 use-case 入口

- [ ] **Step 2: 检查依赖方向**
Run:
- `rg -n "from '@/app'" server/application server/assets server/auth`
- `rg -n "from '@/server/application/workspace'" app/workspace/actions.ts`

Expected:
- server/application 不反向依赖 app
- app/actions 依赖 application

- [ ] **Step 3: 全局检查**
Run:
- `pnpm lint`
- `node --test server/actions/__tests__/*.test.ts server/application/workspace/__tests__/*.test.ts`

Expected: PASS（或仅存量问题，报告中明确）

- [ ] **Step 4: 生成报告**
在 `phase3-verification-report.md` 记录：
- 命令结果
- 风险项
- 进入 Phase 4 的前置条件

- [ ] **Step 5: Commit**
Run:
`git add docs/superpowers/plans/artifacts/phase3-verification-report.md`
`git commit -m "docs(report): add phase3 application layer verification report"`

---

### Task 8: Codify rules for action/application split

**Files:**
- Modify: `.ai-rules/nextjs-runtime-and-boundaries-rules.md`
- Modify: `.ai-rules/nextjs-fullstack-project-rules.md`
- Create: `docs/architecture/action-application-boundary-rules.md`

- [ ] **Step 1: 更新规则文档**
补充：
- action 入口职责边界
- application use-case 职责边界
- use-case 禁止依赖 Next.js route/runtime API（如 `revalidatePath`）

- [ ] **Step 2: 新增边界指南**
写 `action-application-boundary-rules.md` 作为后续 AI 执行参考。

- [ ] **Step 3: Commit**
Run:
`git add .ai-rules/nextjs-runtime-and-boundaries-rules.md .ai-rules/nextjs-fullstack-project-rules.md docs/architecture/action-application-boundary-rules.md`
`git commit -m "docs(architecture): codify action to application boundary rules"`

---

## Exit Criteria (Phase 3)

- [ ] `app/workspace/actions.ts` 完成“薄入口化”
- [ ] `server/application/workspace` 成为 workspace 业务编排主入口
- [ ] action 不再直接承载重业务分支逻辑
- [ ] 依赖方向稳定：`app/actions -> application -> domain`
- [ ] 新增 use-case 测试通过
- [ ] phase3 验证报告完成

---

## Handoff Notes for the next AI

- 本阶段重点是“编排下沉”，不是 domain 目录重拆（Phase 4 再做）。  
- 尽量不改返回结构与用户可见行为，优先保持兼容。  
- `revalidatePath` 继续留在 action 层，避免 use-case 绑定 Next runtime。  
- 每个 Task 独立提交，确保可回滚。  
