import { headers } from 'next/headers'

import { AllClient } from '@/components/workspace/all-client'
import { auth } from '@/server/auth/auth'
import { listAssets } from '@/server/assets/assets.service'

export default async function AllPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  const assets = await listAssets({ userId: session.user.id })

  return <AllClient assets={assets} />
}