import 'server-only'

import { z } from 'zod'

export const bookmarkSummaryOutputSchema = z.object({
  headline: z.string().min(1).max(80),
  summary: z.string().min(1).max(700),
  keyPoints: z.array(z.string().min(1).max(140)).max(6),
  sourceAssetIds: z.array(z.string().min(1)).min(1).max(10),
})

export type BookmarkSummaryOutput = z.infer<typeof bookmarkSummaryOutputSchema>