import 'server-only'

import type { Asset } from '@/server/db/schema'
import { searchAssetsByEmbedding } from '@/server/assets/assets.embedding.service'
import { matchesAssetSearchTimeHint } from '@/server/assets/assets.search-time.pure'
import type { AssetListItem } from '@/shared/assets/assets.types'

export type SemanticSearchOptions = {
  userId: string
  query: string
  typeHint?: Asset['type'] | null
  completionHint?: 'complete' | 'incomplete' | null
  timeFilter?: {
    rangeHint: { startsAt: Date; endsAt: Date }
    timeHint: string | null
  } | null
  limit?: number
}

export type SemanticSearchResult = {
  asset: AssetListItem
  distance: number
}

export async function semanticSearch({
  userId,
  query,
  typeHint,
  completionHint,
  timeFilter,
  limit = 5,
}: SemanticSearchOptions): Promise<SemanticSearchResult[]> {
  try {
    const results = await searchAssetsByEmbedding({
      userId,
      query,
      typeHint,
      completionHint,
      limit,
    })

    const filtered = results
      .filter(
        (result) =>
          !timeFilter ||
          matchesAssetSearchTimeHint(result.asset, timeFilter.rangeHint, timeFilter.timeHint)
      )
      .map((result) => ({
        asset: toAssetListItem(result.asset),
        distance: result.distance,
      }))

    return filtered
  } catch (error) {
    console.warn('[search.semantic] Semantic search failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return []
  }
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
