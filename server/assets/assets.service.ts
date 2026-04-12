import 'server-only'

import { and, desc, eq } from 'drizzle-orm'

import { db } from '@/server/db'
import { assets, type Asset } from '@/server/db/schema'
import { classifyAssetInput } from './assets.classifier'
import { type AssetListItem } from '@/shared/assets/assets.types'

export { type AssetListItem }

type AssetType = Asset['type']

type ListAssetsOptions = {
  userId: string
  type?: AssetType
  limit?: number
}

function clampAssetListLimit(limit = 50) {
  return Math.min(Math.max(1, limit), 100)
}

export async function listAssets({
  userId,
  type,
  limit = 50,
}: ListAssetsOptions): Promise<AssetListItem[]> {
  const conditions = type
    ? and(eq(assets.userId, userId), eq(assets.type, type))
    : eq(assets.userId, userId)

  const rows = await db
    .select()
    .from(assets)
    .where(conditions)
    .orderBy(desc(assets.createdAt))
    .limit(clampAssetListLimit(limit))

  return rows.map(toAssetListItem)
}

export function listLinkAssets(userId: string, limit = 50) {
  return listAssets({ userId, type: 'link', limit })
}

export function listTodoAssets(userId: string, limit = 50) {
  return listAssets({ userId, type: 'todo', limit })
}

export function toAssetListItem(asset: Asset): AssetListItem {
  return {
    id: asset.id,
    originalText: asset.originalText,
    title: asset.originalText.slice(0, 32),
    excerpt: asset.originalText,
    type: asset.type,
    url: asset.url,
    timeText: asset.timeText,
    completed: asset.completedAt !== null,
    createdAt: asset.createdAt,
  }
}

export async function createAsset(input: {
  userId: string
  text: string
}): Promise<{ kind: 'created'; asset: AssetListItem } | { kind: 'query-not-supported' }> {
  const trimmed = input.text.trim()
  if (!trimmed) {
    throw new Error('EMPTY_INPUT')
  }

  const classification = classifyAssetInput(trimmed)

  if (classification.kind === 'query') {
    return { kind: 'query-not-supported' }
  }

  const [created] = await db
    .insert(assets)
    .values({
      id: crypto.randomUUID(),
      userId: input.userId,
      originalText: trimmed,
      type: classification.type,
      url: classification.url,
      timeText: classification.timeText,
      dueAt: classification.dueAt,
    })
    .returning()

  return { kind: 'created', asset: toAssetListItem(created) }
}

export async function listRecentAssets(userId: string, limit = 6): Promise<AssetListItem[]> {
  const clampedLimit = Math.min(Math.max(1, limit), 20)

  const rows = await db
    .select()
    .from(assets)
    .where(eq(assets.userId, userId))
    .orderBy(desc(assets.createdAt))
    .limit(clampedLimit)

  return rows.map(toAssetListItem)
}
