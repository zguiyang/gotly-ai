import 'server-only'

import { setTodoCompletion } from '@/server/assets/assets.service'
import type { SetTodoCompletionInput, AssetListItem } from './workspace.types'

export async function setTodoCompletionUseCase(
  input: SetTodoCompletionInput
): Promise<AssetListItem | null> {
  return setTodoCompletion({
    userId: input.userId,
    assetId: input.assetId,
    completed: input.completed,
  })
}
