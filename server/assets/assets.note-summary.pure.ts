import type { AssetListItem } from '@/shared/assets/assets.types'
import { NOTE_SUMMARY_LIMIT } from '@/server/config/constants'

export { NOTE_SUMMARY_LIMIT }

export type NoteSummaryPromptItem = {
  id: string
  text: string
  createdAt: string
}

export function buildNoteSummaryPromptInput(
  notes: AssetListItem[]
): NoteSummaryPromptItem[] {
  return notes.slice(0, NOTE_SUMMARY_LIMIT).map((note) => ({
    id: note.id,
    text: note.originalText,
    createdAt: new Date(note.createdAt).toISOString(),
  }))
}