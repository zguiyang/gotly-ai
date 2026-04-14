import 'server-only'

import { createAsset, searchAssets } from '@/server/assets/assets.service'
import { reviewUnfinishedTodos } from '@/server/assets/assets.todo-review'
import { summarizeRecentNotes } from '@/server/assets/assets.note-summary'
import { summarizeRecentBookmarks } from '@/server/assets/assets.bookmark-summary'
import { type WorkspaceAssetActionResult } from '@/shared/assets/assets.types'

export type CreateWorkspaceAssetInput = {
  userId: string
  text: string
}

export async function createWorkspaceAssetUseCase(
  input: CreateWorkspaceAssetInput
): Promise<WorkspaceAssetActionResult> {
  const { userId, text } = input

  const result = await createAsset({ userId, text })

  if (result.kind === 'search') {
    const results = await searchAssets({
      userId,
      query: result.query || text,
      typeHint: result.typeHint,
      timeHint: result.timeHint,
      completionHint: result.completionHint,
      limit: 5,
    })

    return {
      kind: 'query',
      query: result.query || text,
      results,
    }
  }

  if (result.kind === 'summary') {
    if (result.summaryTarget === 'unfinished_todos') {
      const review = await reviewUnfinishedTodos(userId)
      return { kind: 'todo-review', review }
    }

    if (result.summaryTarget === 'recent_notes') {
      const summary = await summarizeRecentNotes(userId)
      return { kind: 'note-summary', summary }
    }

    const summary = await summarizeRecentBookmarks(userId)
    return { kind: 'bookmark-summary', summary }
  }

  return { kind: 'created', asset: result.asset }
}
