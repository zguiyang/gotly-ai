import type { User, Session } from '@/server/db/schema'

export interface UserFactoryOptions {
  id?: string
  name?: string
  email?: string
  createdAt?: Date
  updatedAt?: Date
}

export function createUserFixture(options: UserFactoryOptions = {}): User {
  const now = new Date()
  return {
    id: options.id ?? 'user-test-id',
    name: options.name ?? 'Test User',
    email: options.email ?? 'test@example.com',
    emailVerified: options.emailVerified ?? null,
    image: options.image ?? null,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
  }
}

export interface SessionFactoryOptions {
  id?: string
  userId?: string
  sessionToken?: string
  expires?: Date
}

export function createSessionFixture(options: SessionFactoryOptions = {}): Session {
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return {
    id: options.id ?? 'session-test-id',
    sessionToken: options.sessionToken ?? 'test-session-token',
    userId: options.userId ?? 'user-test-id',
    expires: options.expires ?? futureDate,
  }
}

export const userFixtures = {
  default: () => createUserFixture(),
  withEmail: (email: string) => createUserFixture({ email }),
}
