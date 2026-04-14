import 'server-only'

export type AiRunnerOptions = {
  model: unknown
  system: string
  prompt: string
  timeout?: number
}

export async function runAiTextGeneration(_options: AiRunnerOptions): Promise<string> {
  throw new Error('AI runner not yet implemented - Phase 4 placeholder')
}
