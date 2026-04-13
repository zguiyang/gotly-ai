import 'server-only'

import { z } from 'zod'

export const noteSummaryOutputSchema = z.object({
  headline: z.string().min(1).max(80),
  summary: z.string().min(1).max(700),
  keyPoints: z.array(z.string().min(1).max(140)).max(6),
  sourceAssetIds: z.array(z.string().min(1)).min(1).max(10),
})

export type NoteSummaryOutput = z.infer<typeof noteSummaryOutputSchema>