//
// The generation entry for the CONTROL set.
//
// `drizzle-kit` reads a static module, so the factory is called once here with `public`,
// which `appTables` deliberately leaves unqualified: the SQL that comes out names no schema
// and the runner puts it inside whichever container it is applied to. That is what lets one
// file serve a thousand tenants.
//
// This module exists for the generator and is never imported at runtime.
//
import { appTables } from '../pg.js'

const app = appTables('public')

export const partner = app.partner
export const userProfile = app.userProfile
