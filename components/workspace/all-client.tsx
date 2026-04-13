'use client'

import { useState } from 'react'
import {
  FileText,
  Link2,
  CheckCircle,
  MoreVertical,
} from 'lucide-react'

import { type AssetListItem } from '@/shared/assets/assets.types'

type AssetType = 'note' | 'link' | 'todo'
type DateGroup = 'today' | 'yesterday' | 'older'

const typeLabels: Record<AssetType, string> = {
  note: '笔记',
  link: '书签',
  todo: '待办',
}

const filterTabs = [
  { key: 'all', label: '知识库' },
  { key: 'note', label: '笔记' },
  { key: 'link', label: '书签' },
  { key: 'todo', label: '待办' },
] as const

const emptyFilterMessages: Record<string, string> = {
  all: '暂无内容。先从启动台保存一条记录。',
  note: '暂无笔记。先保存一条想法或文本记录。',
  link: '暂无书签。粘贴链接后会出现在这里。',
  todo: '暂无待办。输入带有处理意图的内容后会出现在这里。',
}

function getDateGroup(date: Date): DateGroup {
  const value = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const itemDay = new Date(value.getFullYear(), value.getMonth(), value.getDate())

  if (itemDay.getTime() === today.getTime()) return 'today'
  if (itemDay.getTime() === yesterday.getTime()) return 'yesterday'
  return 'older'
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
  if (days > 1) return `${days}天前`
  if (days === 1) return '昨天'
  if (hours > 1) return `${hours}小时前`
  if (hours === 1) return '1小时前'
  if (minutes > 1) return `${minutes}分钟前`
  return '刚刚'
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center py-6">
      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mr-4">
        {label}
      </span>
      <div className="flex-1 h-px bg-outline-variant/10" />
    </div>
  )
}

function TypePill({ type }: { type: AssetType }) {
  const colors = {
    note: 'bg-primary/10 text-primary',
    link: 'bg-secondary/10 text-secondary',
    todo: 'bg-tertiary/10 text-tertiary',
  }
  return (
    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-medium ${colors[type]}`}>
      {typeLabels[type]}
    </span>
  )
}

const assetTypePresentation = {
  note: { icon: FileText, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  link: { icon: Link2, iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
  todo: { icon: CheckCircle, iconBg: 'bg-tertiary/10', iconColor: 'text-tertiary' },
}

function AssetItem({ asset }: { asset: AssetListItem }) {
  const presentation = assetTypePresentation[asset.type]
  const Icon = presentation.icon

  return (
    <div className="group flex items-center py-5 hover:bg-surface-container-low/50 px-4 -mx-4 rounded-sm transition-all cursor-pointer">
      <div
        className={`w-10 h-10 flex-shrink-0 rounded-sm flex items-center justify-center mr-6 ${presentation.iconBg}`}
      >
        <Icon className={`w-5 h-5 ${presentation.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h3
            className={`text-sm font-medium truncate ${
              asset.completed
                ? 'text-on-surface-variant line-through'
                : 'text-on-surface group-hover:text-primary transition-colors'
            }`}
          >
            {asset.title}
          </h3>
          <TypePill type={asset.type} />
          {asset.completed && (
            <span className="px-2 py-0.5 rounded-sm bg-surface-container-high text-[10px] font-medium text-on-surface-variant">
              已完成
            </span>
          )}
        </div>
        <p
          className={`text-xs line-clamp-1 ${
            asset.completed ? 'text-on-surface-variant/60' : 'text-on-surface-variant'
          }`}
        >
          {asset.excerpt}
        </p>
      </div>
      <div className="ml-4 lg:ml-8 text-right flex-shrink-0">
        <span className="text-xs font-medium text-on-surface-variant/60">
          {asset.timeText || formatRelativeTime(asset.createdAt)}
        </span>
      </div>
      <div className="ml-2 lg:ml-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
        <button
          className="p-1 text-on-surface-variant hover:text-primary rounded-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label="更多操作"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function AllClient({ assets }: { assets: AssetListItem[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const filteredAssets =
    activeFilter === 'all'
      ? assets
      : assets.filter((asset) => asset.type === activeFilter)

  const todayAssets = filteredAssets.filter((asset) => getDateGroup(asset.createdAt) === 'today')
  const yesterdayAssets = filteredAssets.filter((asset) => getDateGroup(asset.createdAt) === 'yesterday')
  const olderAssets = filteredAssets.filter((asset) => getDateGroup(asset.createdAt) === 'older')

  const hasAnyAssets = filteredAssets.length > 0

  return (
    <>
      <div className="mb-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight mb-6 font-[family-name:var(--font-manrope)]">
          知识库
        </h1>
        <div className="flex gap-6 border-b border-outline-variant/10 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
              {activeFilter === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl">
        {todayAssets.length > 0 && (
          <>
            <DateDivider label="今天" />
            {todayAssets.map((asset) => (
              <AssetItem key={asset.id} asset={asset} />
            ))}
          </>
        )}

        {yesterdayAssets.length > 0 && (
          <>
            <DateDivider label="昨天" />
            {yesterdayAssets.map((asset) => (
              <AssetItem key={asset.id} asset={asset} />
            ))}
          </>
        )}

        {olderAssets.length > 0 && (
          <>
            <DateDivider label="更早" />
            {olderAssets.map((asset) => (
              <AssetItem key={asset.id} asset={asset} />
            ))}
          </>
        )}

        {!hasAnyAssets && (
          <div className="mt-20 text-center py-12 border-2 border-dashed border-outline-variant/10 rounded-lg">
            <p className="text-sm text-on-surface-variant font-medium">
              {emptyFilterMessages[activeFilter] ?? emptyFilterMessages.all}
            </p>
          </div>
        )}
      </div>
    </>
  )
}