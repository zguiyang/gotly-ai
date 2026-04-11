export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return
  }

  try {
    const [{ checkDatabaseConnection }, { checkRedisConnection }] = await Promise.all([
      import('@/server/db/client'),
      import('@/server/cache/redis'),
    ])

    const checks = await Promise.allSettled([checkDatabaseConnection(), checkRedisConnection()])

    checks.forEach((result, index) => {
      if (result.status === 'rejected') {
        const service = index === 0 ? 'Postgres' : 'Redis'
        console.error(`[startup] ${service} connection check failed`, result.reason)
      }
    })
  } catch (error) {
    console.error('[startup] Infrastructure startup check failed', error)
  }
}
