'use server'

import { revalidatePath } from 'next/cache'

import { ActionError } from '@/server/actions/action-error'
import { runServerAction } from '@/server/actions/run-server-action'
import { requireUser } from '@/server/auth/session'
import { createAsset, setTodoCompletion, type AssetListItem } from '@/server/assets/assets.service'

export async function createWorkspaceAssetAction(
  input: unknown
): Promise<AssetListItem> {
  return runServerAction('workspace.createAsset', async () => {
    const user = await requireUser()

    if (typeof input !== 'string') {
      throw new ActionError('先输入一句内容。', 'EMPTY_INPUT')
    }

    const trimmed = input.trim()
    if (!trimmed) {
      throw new ActionError('先输入一句内容。', 'EMPTY_INPUT')
    }

    const result = await createAsset({ userId: user.id, text: trimmed })

    if (result.kind === 'query-not-supported') {
      throw new ActionError(
        '查询功能下一步接入，先试试输入一条记录或链接。',
        'QUERY_NOT_SUPPORTED'
      )
    }

    revalidatePath('/workspace')
    return result.asset
  })
}

function parseTodoCompletionInput(input: unknown): {
  assetId: string
  completed: boolean
} {
  if (
    !input ||
    typeof input !== 'object' ||
    !('assetId' in input) ||
    !('completed' in input)
  ) {
    throw new ActionError('待办状态更新失败，请重试。', 'INVALID_TODO_COMPLETION_INPUT')
  }

  const { assetId, completed } = input

  if (typeof assetId !== 'string' || !assetId.trim() || typeof completed !== 'boolean') {
    throw new ActionError('待办状态更新失败，请重试。', 'INVALID_TODO_COMPLETION_INPUT')
  }

  return { assetId: assetId.trim(), completed }
}

export async function setTodoCompletionAction(
  input: unknown
): Promise<AssetListItem> {
  return runServerAction('workspace.setTodoCompletion', async () => {
    const user = await requireUser()
    const parsed = parseTodoCompletionInput(input)

    const updated = await setTodoCompletion({
      userId: user.id,
      assetId: parsed.assetId,
      completed: parsed.completed,
    })

    if (!updated) {
      throw new ActionError('没有找到这条待办，或你没有权限更新它。', 'TODO_NOT_FOUND')
    }

    revalidatePath('/workspace')
    revalidatePath('/workspace/all')
    revalidatePath('/workspace/todos')

    return updated
  })
}