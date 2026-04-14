import type { AssetListItem } from '@/shared/assets/assets.types'
import { TODO_REVIEW_LIMIT } from '@/server/config/constants'

export type TodoReviewPromptItem = {
  id: string
  text: string
  timeText: string | null
  dueAt: string | null
  createdAt: string
}

export function buildTodoReviewPromptInput(
  todos: AssetListItem[]
): TodoReviewPromptItem[] {
  return todos.slice(0, TODO_REVIEW_LIMIT).map((todo) => ({
    id: todo.id,
    text: todo.originalText,
    timeText: todo.timeText,
    dueAt: todo.dueAt ? new Date(todo.dueAt).toISOString() : null,
    createdAt: new Date(todo.createdAt).toISOString(),
  }))
}