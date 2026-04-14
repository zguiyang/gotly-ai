import 'server-only'

export async function searchAssets(_options: {
  userId: string
  query: string
}): Promise<unknown[]> {
  throw new Error('Search service not yet implemented - Phase 4 placeholder')
}
