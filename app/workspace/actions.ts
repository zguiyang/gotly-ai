'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { auth } from '@/server/auth/auth'
import { createAsset, type AssetListItem } from '@/server/assets/assets.service'

export async function createWorkspaceAssetAction(
  input: unknown
): Promise<
  | { ok: true; asset: AssetListItem }
  | { ok: false; error: 'UNAUTHORIZED' | 'EMPTY_INPUT' | 'QUERY_NOT_SUPPORTED' | 'UNKNOWN'; message: string }
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return { ok: false, error: 'UNAUTHORIZED', message: '请先登录。' }
  }

  if (typeof input !== 'string') {
    return { ok: false, error: 'EMPTY_INPUT', message: '先输入一句内容。' }
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'EMPTY_INPUT', message: '先输入一句内容。' }
  }

  try {
    const result = await createAsset({ userId: session.user.id, text: trimmed })

    if (result.kind === 'query-not-supported') {
      return {
        ok: false,
        error: 'QUERY_NOT_SUPPORTED',
        message: '查询功能下一步接入，先试试输入一条记录或链接。',
      }
    }

    revalidatePath('/workspace')
    return { ok: true, asset: result.asset }
  } catch (error) {
    console.error('[createWorkspaceAssetAction]', error)
    return { ok: false, error: 'UNKNOWN', message: '保存失败，请重试。' }
  }
}
