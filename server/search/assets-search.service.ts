import 'server-only'

import type { Asset } from '@/server/db/schema'
import { keywordSearch } from './keyword-search.service'
import { semanticSearch } from './semantic-search.service'
import {
  buildAssetSearchPathLog,
  type AssetSearchPathLogInput,
} from '@/server/assets/assets.search-logging.pure'
import { parseAssetSearchTimeHint } from '@/server/assets/assets.time'
import type { AssetListItem } from '@/shared/assets/assets.types'

export type AssetsSearchOptions = {
  userId: string
  query: string
  typeHint?: Asset['type'] | null
  timeHint?: string | null
  completionHint?: 'complete' | 'incomplete' | null
  limit?: number
}

function clampLimit(limit = 5, min = 1, max = 20): number {
  return Math.min(Math.max(limit, min), max)
}

export async function searchAssets(options: AssetsSearchOptions): Promise<AssetListItem[]> {
  const { userId, query, typeHint, timeHint, completionHint, limit = 5 } = options
  const trimmed = query.trim()
  if (!trimmed) return []

  const clampedLimit = clampLimit(limit)

  const timeRangeHint = parseAssetSearchTimeHint(timeHint)
  const timeFilter =
    timeRangeHint && typeHint === 'todo'
      ? { rangeHint: timeRangeHint, timeHint }
      : null

  const semanticResults = await semanticSearch({
    userId,
    query: trimmed,
    typeHint,
    completionHint,
    timeFilter,
    limit: clampedLimit,
  })

  const semanticFailed = false
  const semanticCandidates = semanticResults.map((r) => ({
    ...r.asset,
    score: Math.max(0, 10 - r.distance * 10),
  }))

  const keywordCandidates = await keywordSearch({
    userId,
    query: trimmed,
    typeHint,
    timeHint,
    completionHint,
    limit: 100,
  })

  const ranked = new Map<string, { asset: AssetListItem; score: number }>()

  for (const result of semanticCandidates) {
    ranked.set(result.id, { asset: result, score: result.score })
  }

  for (const candidate of keywordCandidates) {
    const existing = ranked.get(candidate.asset.id)
    ranked.set(candidate.asset.id, {
      asset: candidate.asset,
      score: (existing?.score ?? 0) + candidate.score,
    })
  }

  const results = Array.from(ranked.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, clampedLimit)
    .map((candidate) => candidate.asset)

  logAssetSearchPath({
    query: trimmed,
    typeHint,
    timeHint,
    completionHint,
    timeFilterApplied: Boolean(timeFilter),
    semanticAttempted: true,
    semanticFailed,
    semanticCandidateCount: semanticResults.length,
    keywordCandidateCount: keywordCandidates.length,
    returnedCount: results.length,
  })

  return results
}

function logAssetSearchPath(input: AssetSearchPathLogInput) {
  console.info('[search] Path selected', buildAssetSearchPathLog(input))
}
