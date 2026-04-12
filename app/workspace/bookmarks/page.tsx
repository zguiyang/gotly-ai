import { headers } from 'next/headers'

import { BookmarksClient } from '@/components/workspace/bookmarks-client'
import { auth } from '@/server/auth/auth'
import { listLinkAssets } from '@/server/assets/assets.service'

export default async function BookmarksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  const bookmarks = await listLinkAssets(session.user.id)

  return <BookmarksClient bookmarks={bookmarks} />
}