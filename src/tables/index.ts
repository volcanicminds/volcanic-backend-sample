import type { DataHandle } from '@volcanicminds/backend'
import { access } from '@volcanicminds/backend/db'
import { appTables, type AppTables } from './pg.js'

//
// The application's tables, for the container a request is on.
//
// One cache keyed by the locator, because building a table object is cheap but not free and a
// request does it on every call. The key IS the locator on purpose: under the `schema`
// tenancy strategy two tenants differ in nothing but that string, and a cache that ignored it
// would hand tenant B the object that names tenant A's schema — defect D-01 rebuilt inside
// the consumer's own code. Two lines well spent.
//
const cache = new Map<string, AppTables>()

export function tablesFor(handle: DataHandle): AppTables {
  const { dialect, locator } = access(handle, 'tablesFor')

  // This project declares Postgres and only Postgres (see src/config/general.ts). The check
  // is here rather than nowhere because a wrong dialect would otherwise surface as SQL the
  // engine does not understand, three layers down.
  if (dialect !== 'postgres') {
    throw new Error(`This application's tables are declared for Postgres; the container speaks '${dialect}'`)
  }

  const key = locator || 'public'
  const cached = cache.get(key)
  if (cached) return cached

  const tables = appTables(key)
  cache.set(key, tables)
  return tables
}

export type { AppTables }
export { PARTNER_TYPES, USER_LANGUAGES } from './enums.js'
export type { PartnerType, UserLanguage } from './enums.js'
