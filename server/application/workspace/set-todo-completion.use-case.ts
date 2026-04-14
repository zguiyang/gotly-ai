import 'server-only'

import { ActionError, ACTION_ERROR_CODES } from '@/server/actions/action-error'
import { setTodoCompletion } from '@/server/assets/assets.service'
import type { SetTodoCompletionInput, AssetListItem } from './workspace.types'

export async function setTodoCompletionUseCase(
  input: SetTodoCompletionInput
): Promise<AssetListItem> {
  const updated = await setTodoCompletion({
    userId: input.userId,
    assetId: input.assetId,
    completed: input.completed,
  })

  if (!updated) {
    throw new ActionError(
      '没有找到这条待办，或你没有权限更新它。',
      ACTION_ERROR_CODES.TODO_NOT_FOUND
    )
  }

  return updated
}
