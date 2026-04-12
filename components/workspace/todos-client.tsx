'use client'

import { Check, Circle, Clock, MoreHorizontal } from 'lucide-react'

import { type AssetListItem } from '@/shared/assets/assets.types'

type GroupKey = 'today' | 'thisWeek' | 'noDate' | 'completed'

function getGroupKey(item: AssetListItem): GroupKey {
  if (item.completed) return 'completed'
  if (item.timeText?.includes('今天') || item.timeText?.includes('明天')) return 'today'
  if (item.timeText?.includes('本周') || item.timeText?.includes('周')) return 'thisWeek'
  return 'noDate'
}

const groupLabels: Record<GroupKey, string> = {
  today: '今天',
  thisWeek: '本周',
  noDate: '无截止日期',
  completed: '已完成',
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <span className="text-xs text-on-surface-variant/50">·</span>
      <span className="text-xs text-on-surface-variant/60">{count} 项</span>
    </div>
  )
}

function TodoItemComponent({ item }: { item: AssetListItem }) {
  return (
    <div
      className={`group flex items-start justify-between py-3.5 px-4 -mx-4 transition-all rounded-sm cursor-default ${
        item.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5 shrink-0" title="待办完成状态将在下一步接入">
          {item.completed ? (
            <Check className="w-5 h-5 text-primary" />
          ) : (
            <Circle className="w-5 h-5 text-on-surface-variant/30" />
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h4
            className={`text-sm font-medium leading-snug truncate ${
              item.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'
            }`}
          >
            {item.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant/60">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.timeText || '无截止日期'}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
            <span>来自统一入口</span>
          </div>
        </div>
      </div>
      <button
        className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-container-high rounded-sm cursor-default"
        aria-label="更多操作"
      >
        <MoreHorizontal className="w-4 h-4 text-on-surface-variant" />
      </button>
    </div>
  )
}

function TodoSection({ items, emptyMessage }: { items: AssetListItem[]; emptyMessage: string }) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-on-surface-variant/50">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={item.id}>
          <TodoItemComponent item={item} />
          {index < items.length - 1 && (
            <div className="h-px bg-outline-variant/10 mx-4" />
          )}
        </div>
      ))}
    </div>
  )
}

export function TodosClient({ todos }: { todos: AssetListItem[] }) {
  const grouped = {
    today: todos.filter((t) => getGroupKey(t) === 'today'),
    thisWeek: todos.filter((t) => getGroupKey(t) === 'thisWeek'),
    noDate: todos.filter((t) => getGroupKey(t) === 'noDate'),
    completed: todos.filter((t) => getGroupKey(t) === 'completed'),
  }

  const showEmptyState = todos.length === 0

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold tracking-widest text-primary uppercase opacity-60">
            Personal Inbox
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight font-[family-name:var(--font-manrope)]">
          待处理
        </h1>
        <p className="mt-2 text-on-surface-variant text-sm max-w-2xl leading-relaxed">
          AI 自动捕获的灵感与待办，正在等待你的确认或处理。
        </p>
      </div>

      {showEmptyState ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-on-surface-variant">
            暂无待处理事项
          </p>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            从统一入口保存新的待办后会出现在这里
          </p>
        </div>
      ) : (
        <div className="space-y-8 max-w-2xl">
          {grouped.today.length > 0 && (
            <div>
              <SectionHeader label={groupLabels.today} count={grouped.today.length} />
              <div className="bg-surface-container-lowest rounded-lg">
                <TodoSection items={grouped.today} emptyMessage="今天没有待办" />
              </div>
            </div>
          )}

          {grouped.thisWeek.length > 0 && (
            <div>
              <SectionHeader label={groupLabels.thisWeek} count={grouped.thisWeek.length} />
              <div className="bg-surface-container-lowest rounded-lg">
                <TodoSection items={grouped.thisWeek} emptyMessage="本周没有待办" />
              </div>
            </div>
          )}

          {grouped.noDate.length > 0 && (
            <div>
              <SectionHeader label={groupLabels.noDate} count={grouped.noDate.length} />
              <div className="bg-surface-container-lowest rounded-lg">
                <TodoSection items={grouped.noDate} emptyMessage="没有无截止日期的待办" />
              </div>
            </div>
          )}

          {grouped.completed.length > 0 && (
            <div>
              <SectionHeader label={groupLabels.completed} count={grouped.completed.length} />
              <div className="bg-surface-container-lowest rounded-lg">
                <TodoSection items={grouped.completed} emptyMessage="没有已完成的待办" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
