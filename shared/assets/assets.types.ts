export type AssetListItem = {
  id: string
  originalText: string
  title: string
  excerpt: string
  type: 'note' | 'link' | 'todo'
  url: string | null
  timeText: string | null
  completed: boolean
  createdAt: Date
}

export type AssetQueryResult = {
  query: string
  results: AssetListItem[]
}

export type WorkspaceAssetActionResult =
  | { kind: 'created'; asset: AssetListItem }
  | { kind: 'query'; query: string; results: AssetListItem[] }
