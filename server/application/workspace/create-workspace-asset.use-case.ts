import 'server-only'

import { createAsset, searchAssets } from '@/server/assets/assets.service'
import type { CreateWorkspaceAssetInput, WorkspaceAssetActionResult } from './workspace.types'

export async function createWorkspaceAssetUseCase(
  input: CreateWorkspaceAssetInput
): Promise<WorkspaceAssetActionResult> {
  const result = await createAsset({ userId: input.userId, text: input.text })

  if (result.kind === 'search') {
    const results = await searchAssets({
      userId: input.userId,
      query: result.query || input.text,
      typeHint: result.typeHint,
      timeHint: result.timeHint,
      completionHint: result.completionHint,
      limit: 5,
    })

    return {
      kind: 'query',
      query: result.query || input.text,
      results,
    }
  }

  if (result.kind === 'summary') {
    // TODO: Delegate to summary use-cases when they are implemented
    throw new Error('Summary use cases not yet implemented in application layer')
  }

  return { kind: 'created', asset: result.asset }
}
