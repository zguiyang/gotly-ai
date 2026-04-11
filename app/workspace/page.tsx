import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { WorkspaceClient } from '@/components/workspace/workspace-client'
import { auth } from '@/server/auth/auth'
import { listRecentAssets } from '@/server/assets/assets.service'

export default async function WorkspacePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  const recentAssets = await listRecentAssets(session.user.id)

  return <WorkspaceClient recentAssets={recentAssets} />
}