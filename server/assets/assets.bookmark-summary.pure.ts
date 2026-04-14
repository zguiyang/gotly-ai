import type { AssetListItem } from '@/shared/assets/assets.types'
import { BOOKMARK_SUMMARY_LIMIT } from '@/server/config/constants'

export { BOOKMARK_SUMMARY_LIMIT }

export type BookmarkSummaryPromptItem = {
  id: string
  text: string
  url: string | null
  createdAt: string
}

export function buildBookmarkSummaryPromptInput(
  bookmarks: AssetListItem[]
): BookmarkSummaryPromptItem[] {
  return bookmarks.slice(0, BOOKMARK_SUMMARY_LIMIT).map((bookmark) => ({
    id: bookmark.id,
    text: bookmark.originalText,
    url: bookmark.url,
    createdAt: new Date(bookmark.createdAt).toISOString(),
  }))
}