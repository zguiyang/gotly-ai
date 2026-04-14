import 'server-only'

import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/server/db'
import { assets, type Asset } from '@/server/db/schema'
import { type AssetListItem } from '@/shared/assets/assets.types'

const QUERY_FILLERS = [
  '帮我',
  '找一下',
  '查一下',
  '我',
  '最近',
  '上次',
  '之前',
  '记过',
  '记录过',
  '关于',
  '内容',
  '在哪',
  '哪里',
  '有哪些',
  '什么',
  '一下',
  '的',
  '吗',
  '么',
]

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[，。！？、,.!?;；:：()[\]{}"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getAssetSearchTerms(query: string) {
  let normalized = normalizeSearchText(query)

  for (const filler of QUERY_FILLERS) {
    normalized = normalized.replaceAll(filler, ' ')
  }

  return Array.from(
    new Set(
      normalized
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 2)
    )
  ).slice(0, 8)
}

const ASSET_TYPE_TERMS: Record<Asset['type'], string[]> = {
  note: ['记录', '笔记', '想法', '文案'],
  link: ['书签', '链接', '文章', '收藏', '资料'],
  todo: ['待办', '待处理', '任务', '事项', '要做'],
}

function getTypeHintScore(query: string, type: Asset['type']) {
  return ASSET_TYPE_TERMS[type].some((term) => query.includes(term)) ? 2 : 0
}

function scoreAssetForQuery(asset: Asset, query: string, terms: string[]) {
  const searchable = normalizeSearchText(
    [
      asset.originalText,
      asset.url,
      asset.timeText,
      ASSET_TYPE_TERMS[asset.type].join(' '),
    ]
      .filter(Boolean)
      .join(' ')
  )

  let score = getTypeHintScore(query, asset.type)

  for (const term of terms) {
    if (searchable.includes(term)) {
      score += term.length >= 4 ? 3 : 2
    }
  }

  if (query.includes('这周') && asset.timeText?.includes('本周')) {
    score += 2
  }

  return score
}

export type KeywordSearchOptions = {
  userId: string
  query: string
  typeHint?: Asset['type'] | null
  timeHint?: string | null
  completionHint?: 'complete' | 'incomplete' | null
  limit?: number
}

export type KeywordSearchCandidate = {
  asset: AssetListItem
  score: number
}

export function keywordSearchScoreAsset(
  asset: Asset,
  query: string,
  terms: string[],
  timeFilter: { rangeHint: { startsAt: Date; endsAt: Date }; timeHint: string | null } | null,
  timeHint: string | null
): number {
  let score = scoreAssetForQuery(asset, query, terms)

  if (timeHint && asset.timeText?.includes(timeHint)) {
    score += 2
  }

  return score
}

export async function keywordSearch({
  userId,
  query,
  typeHint,
  completionHint,
}: KeywordSearchOptions): Promise<KeywordSearchCandidate[]> {
  void typeHint
  void completionHint
  void userId
  void query
  const trimmed = query.trim()
  if (!trimmed) return []

  const conditions = [eq(assets.userId, userId)]

  if (typeHint) {
    conditions.push(eq(assets.type, typeHint))
  }

  if (completionHint === 'complete') {
    conditions.push(sql`${assets.completedAt} is not null`)
  }

  if (completionHint === 'incomplete') {
    conditions.push(sql`${assets.completedAt} is null`)
  }

  const rows = await db
    .select()
    .from(assets)
    .where(and(...conditions))
    .orderBy(desc(assets.createdAt))
    .limit(100)

  const terms = getAssetSearchTerms(trimmed)

  return rows
    .map((asset) => {
      const score = scoreAssetForQuery(asset, trimmed, terms)
      return { asset: toAssetListItem(asset), score }
    })
    .filter((candidate) => candidate.score > 0)
}

function toAssetListItem(asset: Asset): AssetListItem {
  return {
    id: asset.id,
    originalText: asset.originalText,
    title: asset.title,
    excerpt: asset.excerpt,
    type: asset.type,
    url: asset.url,
    timeText: asset.timeText,
    dueAt: asset.dueAt,
    completed: asset.completedAt != null,
    createdAt: asset.createdAt,
  }
}
