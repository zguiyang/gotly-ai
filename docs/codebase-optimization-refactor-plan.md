# Gotly AI Codebase Optimization & Refactor Plan

> **Baseline Decision:** Workspace menu structure and copy are **source of truth from current code**. PRD should be updated to match implementation, not vice versa.

## 1. Goal

在不改变当前产品信息架构（尤其是菜单结构与文案）的前提下，提升代码一致性、可维护性、边界清晰度与后续迭代效率，优先解决重复逻辑、状态复杂度、样式系统不一致和文档漂移问题。

## 2. Scope

In scope:
- Workspace 路由与会话校验一致性
- 导航配置去重（仅结构复用，不改文案）
- Workspace 页面组件组织与共享逻辑抽取
- Server Action 错误语义与可观测性改进
- README / PRD 与当前实现对齐

Out of scope:
- 调整菜单目录结构与命名文案
- 改变现有业务能力边界（AI 分类、总结、向量检索）
- 新增大功能模块

## 3. Current Pain Points

1. Session 获取与鉴权行为在 workspace 页面存在重复实现与行为不一致。
2. 侧边栏与顶部移动导航维护了重复 nav 配置，后续修改易漂移。
3. Workspace 客户端组件中存在重复时间格式化/分组逻辑，页面间行为一致性弱。
4. `notes` 页面存在 token 外样式写法（硬编码颜色）导致设计系统不统一。
5. 统一入口页面状态分支较多，交互状态与展示状态耦合，后续功能扩展风险高。
6. 项目文档（尤其 README、PRD）与实际实现存在漂移。

## 4. Refactor Principles

1. Keep route files thin; move repeated orchestration to reusable server helpers.
2. Single source of truth for navigation configuration.
3. Shared UI behavior in focused helper modules, not duplicated in page components.
4. Prefer additive refactor with low regression risk; avoid large-bang rewrites.
5. Every phase must have explicit acceptance criteria and rollback-safe boundaries.

## 5. Phased Execution Plan

### Phase 1: Auth & Route Consistency (High Priority)

Objective:
- 统一 workspace 路由的鉴权与 session 获取路径，消除重复和 `return null` 的分支差异。

Files:
- Modify: `app/workspace/layout.tsx`
- Modify: `app/workspace/page.tsx`
- Modify: `app/workspace/all/page.tsx`
- Modify: `app/workspace/bookmarks/page.tsx`
- Modify: `app/workspace/todos/page.tsx`
- Modify: `app/workspace/notes/page.tsx`
- Create: `server/auth/workspace-session.ts` (or equivalent server-only helper)

Actions:
1. 提供统一 `requireWorkspaceUser()` helper，封装 `auth.api.getSession + redirect` 行为。
2. 子页面复用 layout 已获取的鉴权策略，避免每页重复拉 session。
3. 明确“未登录统一重定向”的单一行为。

Acceptance:
1. 所有 `/workspace*` 页面未登录均统一跳转 `/auth/sign-in`。
2. workspace 子页面中不再出现重复 session 拉取样板代码。
3. 与当前页面可见功能保持一致。

### Phase 2: Navigation Config Single Source (High Priority)

Objective:
- 在不改菜单文案和路由的前提下，去除重复 nav 定义。

Files:
- Create: `shared/workspace/workspace-nav.ts` (or `components/workspace/nav-config.ts`)
- Modify: `components/workspace/sidebar.tsx`
- Modify: `components/workspace/top-app-bar.tsx`

Actions:
1. 提取 `navItems` 到共享配置，保留当前 label/href/icon 语义。
2. `Sidebar` 与移动端 `Sheet` 导航统一读取配置。
3. 保持 active 判断逻辑一致并可复用。

Acceptance:
1. 菜单项内容、顺序、链接与当前行为完全一致。
2. 导航配置只维护一份。

### Phase 3: Workspace UI Behavior Consolidation (High Priority)

Objective:
- 抽取重复时间处理和列表分组逻辑，降低组件复杂度。

Files:
- Create: `shared/assets/asset-time-display.ts` (format/group helpers)
- Modify: `components/workspace/all-client.tsx`
- Modify: `components/workspace/notes-client.tsx`
- Modify: `components/workspace/todos-client.tsx`

Actions:
1. 抽取相对时间显示、日期分组、时间文案 fallback。
2. `todos` 分组逻辑统一封装，避免组件内散落规则。
3. 为共享 helper 增加纯函数测试（已有 `server/assets/__tests__` 风格可复用）。

Acceptance:
1. 页面显示不变或仅做一致性增强，不引入功能回归。
2. 组件内重复时间逻辑显著减少。
3. 新 helper 具备测试覆盖。

### Phase 4: Design Token Alignment for Workspace (Medium Priority)

Objective:
- 统一 workspace 视觉代码风格，减少硬编码颜色与半独立样式岛。

Files:
- Modify: `components/workspace/notes-client.tsx`
- Optional Modify: `app/globals.css`

Actions:
1. 将 `notes` 页面中的 `bg-white / gray-*` 等硬编码替换为 design token 体系。
2. 统一交互态（hover/focus）表现与其他 workspace 页面策略。
3. 不改变既有信息层级，仅做系统化样式收敛。

Acceptance:
1. Workspace 各页面视觉 token 使用一致。
2. 暗色模式变量行为不被破坏。

### Phase 5: Workspace Input State Refactor (Medium Priority)

Objective:
- 降低 `workspace-client.tsx` 的状态分支复杂度，提升可扩展性。

Files:
- Modify: `components/workspace/workspace-client.tsx`
- Create: `components/workspace/workspace-result-panels.tsx`
- Optional Create: `components/workspace/use-workspace-action-state.ts`

Actions:
1. 拆分结果面板渲染（query/todo-review/note-summary/bookmark-summary）。
2. 统一 action 状态机（idle/submitting/success/error）与消息策略。
3. 保持与现有 server action 协议兼容。

Acceptance:
1. 提交、查询、总结、复盘流程行为保持一致。
2. 主组件行数和分支复杂度下降。
3. 更易增加后续结果类型而不扩散改动面。

### Phase 6: Error Semantics & Observability Hardening (Medium Priority)

Objective:
- 优化前后端错误语义和日志字段，方便排查问题。

Files:
- Modify: `server/actions/run-server-action.ts`
- Modify: `server/actions/action-error.ts`
- Modify: `components/actions/call-action.ts`
- Optional Modify: `server/assets/assets.search-logging.pure.ts`

Actions:
1. 规范 ActionError code 枚举化命名与对外 message 映射。
2. 统一 client toast 的 fallback 与错误归因展示策略。
3. 对关键路径日志加稳定字段（action, requestId, errorCode, durationMs）。

Acceptance:
1. 失败场景下用户提示稳定、可理解。
2. 日志可直接关联请求链路并支持问题定位。

### Phase 7: Documentation Sync (High Priority, Can Run Early)

Objective:
- 让文档与实际实现一致，减少认知误导。

Files:
- Modify: `README.md`
- Modify: `prd/gotly-ai-mvp-prd.md`
- Optional Modify: `prd/gotly-ai-prd.md`

Actions:
1. README 去掉默认模板内容，改为项目真实启动/脚本/架构说明（pnpm-only）。
2. PRD 反向对齐当前菜单与已落地能力（按本次共识：代码为准）。
3. 在 PRD 中标记“历史差异已对齐日期”。

Acceptance:
1. 新成员按 README 可直接正确启动项目。
2. PRD 与当前线上/本地行为不再冲突。

## 6. Suggested Execution Order

1. Phase 7 (README/PRD 同步，快速消除认知偏差)
2. Phase 1 (鉴权一致性)
3. Phase 2 (导航配置去重)
4. Phase 3 (共享逻辑抽取)
5. Phase 4 (样式系统收敛)
6. Phase 5 (workspace 状态重构)
7. Phase 6 (错误与观测增强)

## 7. Verification Strategy

Static:
1. `pnpm lint`
2. Type checks via Next/TS build path (project standard command)

Runtime:
1. 手动验证 `/workspace`, `/workspace/all`, `/workspace/notes`, `/workspace/bookmarks`, `/workspace/todos`
2. 未登录访问 workspace 路由重定向验证
3. 统一入口四类结果流转验证（创建、查询、待办复盘、摘要）

Regression focus:
1. 导航 active 态与移动菜单行为
2. Todo 完成/恢复 optimistic update
3. AI summary fallback path

## 8. Delivery Style

1. 每个 Phase 独立提交，避免大批量不可回滚改动。
2. 每个 Phase 都先做最小可验证切片，再做清理。
3. 所有“行为不变”重构优先，功能增强后置。
