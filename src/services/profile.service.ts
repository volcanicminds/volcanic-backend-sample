import { eq } from 'drizzle-orm'
import type { DataHandle } from '@volcanicminds/backend'
import { access } from '@volcanicminds/backend/db'
import { tablesFor } from '../tables/index.js'
import type { UserLanguage } from '../tables/index.js'

export interface UserProfile {
  userId: string
  firstName: string | null
  lastName: string | null
  language: UserLanguage
}

//
// The application's own facts about a user.
//
// In v4 `firstName`, `lastName` and `language` were three columns added to the framework's
// `User` entity by subclassing it. v5 forbids that (docs/SCHEMA_V5.md §6), and the reason is
// not tidiness: a framework table redefined by a consumer collides with every future
// framework migration, and the collision arrives at upgrade time on a deployment that has
// already gone to production. A table of one's own, keyed by `user.id`, costs a join and
// survives upgrades.
//
export async function readProfile(handle: DataHandle, userId: string): Promise<UserProfile | null> {
  const { db } = access(handle, 'readProfile')
  const { userProfile } = tablesFor(handle)
  const rows = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1)
  return (rows[0] as UserProfile) ?? null
}

export async function writeProfile(
  handle: DataHandle,
  userId: string,
  data: Partial<Omit<UserProfile, 'userId'>>
): Promise<UserProfile> {
  const { db } = access(handle, 'writeProfile')
  const { userProfile } = tablesFor(handle)

  // Upsert, because a profile is created by the first thing that has something to say about
  // the user and not by the registration: a row that must exist before it has content is a
  // row that goes missing for every user created before this table did.
  const rows = await db
    .insert(userProfile)
    .values({ userId, ...data })
    .onConflictDoUpdate({ target: userProfile.userId, set: { ...data, updatedAt: new Date() } })
    .returning()
  return rows[0] as UserProfile
}
