import type { AssetListItem } from '@/shared/assets/assets.types'

export type BookmarkSummaryPromptItem = {
  id: string
  text: string
  url: string | null
  createdAt: string
}

export const BOOKMARK_SUMMARY_LIMIT = 10

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