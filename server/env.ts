import 'server-only'

import { serverEnvSchema } from '@/shared/env-schema'

const env = serverEnvSchema.parse(process.env)

export const serverEnv = {
  database: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DATABASE,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: env.REDIS_DB,
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
  },
} as const
