import 'server-only'

import { summarizeRecentBookmarks } from '@/server/assets/assets.bookmark-summary'
import type { SummarizeRecentBookmarksInput, BookmarkSummaryResult } from './workspace.types'

export async function summarizeRecentBookmarksUseCase(
  input: SummarizeRecentBookmarksInput
): Promise<BookmarkSummaryResult> {
  return summarizeRecentBookmarks(input.userId)
}
