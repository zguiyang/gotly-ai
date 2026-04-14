import 'server-only'

import { summarizeRecentNotes } from '@/server/assets/assets.note-summary'
import type { SummarizeRecentNotesInput, NoteSummaryResult } from './workspace.types'

export async function summarizeRecentNotesUseCase(
  input: SummarizeRecentNotesInput
): Promise<NoteSummaryResult> {
  return summarizeRecentNotes(input.userId)
}
