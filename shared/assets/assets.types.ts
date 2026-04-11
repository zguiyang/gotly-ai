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
