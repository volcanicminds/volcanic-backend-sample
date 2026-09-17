//
// The generation entry for the TENANT set.
//
// The same application tables: on a single-tenant deployment they live in the control plane,
// on a multi-tenant one in each customer's container. Two sets and not one because the two
// have different lives — the control plane also carries the registry and the platform
// identities, which no container ever sees.
//
import { appTables } from '../pg.js'

const app = appTables('public')

export const partner = app.partner
export const userProfile = app.userProfile
