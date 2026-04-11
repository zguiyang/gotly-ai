import 'server-only'

export class ActionError extends Error {
  constructor(
    public readonly publicMessage: string,
    public readonly code = 'ACTION_ERROR'
  ) {
    super(publicMessage)
    this.name = 'ActionError'
  }
}

export function getActionErrorMessage(error: unknown, fallback = '操作失败，请重试。') {
  if (error instanceof ActionError) {
    return error.publicMessage
  }

  return fallback
}