import 'server-only'

import { db } from '@/server/db'
import { assets, type Asset } from '@/server/db/schema'

export async function findAssetById(assetId: string): Promise<Asset | null> {
  const [asset] = await db.select().from(assets).where(sql`id = ${assetId}`).limit(1)
  return asset ?? null
}

import { sql } from 'drizzle-orm'

export async function listAssetsByUser(
  userId: string,
  _limit = 50
): Promise<Asset[]> {
  const rows = await db
    .select()
    .from(assets)
    .where(sql`user_id = ${userId}`)
    .orderBy(sql`created_at desc`)
    .limit(_limit)
  return rows
}
