'use server'

import { revalidatePath } from 'next/cache'

import { ActionError } from '@/server/actions/action-error'
import { runServerAction } from '@/server/actions/run-server-action'
import { requireUser } from '@/server/auth/session'
import { createAsset, type AssetListItem } from '@/server/assets/assets.service'

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