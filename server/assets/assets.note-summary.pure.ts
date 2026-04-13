import type { AssetListItem } from '@/shared/assets/assets.types'

export type NoteSummaryPromptItem = {
  id: string
  text: string
  createdAt: string
}

export const NOTE_SUMMARY_LIMIT = 10

export function buildNoteSummaryPromptInput(
  notes: AssetListItem[]
): NoteSummaryPromptItem[] {
  return notes.slice(0, NOTE_SUMMARY_LIMIT).map((note) => ({
    id: note.id,
    text: note.originalText,
    createdAt: new Date(note.createdAt).toISOString(),
  }))
}