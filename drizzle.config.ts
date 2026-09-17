import type { Config } from 'drizzle-kit'

//
// How this project's migrations are written.
//
// Only the application's own tables: the framework generates and ships the migrations of its
// own (`user`, `token`, `change`, the registry), and the runner reads its folder before this
// one. Two folders rather than one merged set, so that looking at a failed container you can
// say whose change broke it.
//
// Forward only, like the framework's: `drizzle-kit` generates no `down`, and a `down` on a
// destructive migration restores the form and not the data — a promise that fails exactly
// when it is called on. Reversibility lives in expand/contract releases.
//
// The dialect is part of the folder: the framework reads `migrations/<set>/<dialect>`
// (`migrationSets()` in `@volcanicminds/backend/db`), because a SQLite migration and a
// Postgres one are different SQL. Until T-10.19 this wrote to `migrations/<set>`, a folder the
// runner never opens, and it does not complain about a folder that is missing: the project's
// tables were simply never created, and `db:migrate` reported success. Postgres only here,
// because this sample has no SQLite schema.
//
const sets = {
  control: { schema: './src/tables/entry/control.pg.ts', out: './migrations/control/pg' },
  tenant: { schema: './src/tables/entry/tenant.pg.ts', out: './migrations/tenant/pg' }
} as const

const chosen = sets[(process.env.MIGRATION_SET as keyof typeof sets) || 'control']
if (!chosen) {
  throw new Error(`MIGRATION_SET must be one of: ${Object.keys(sets).join(', ')}`)
}

export default {
  ...chosen,
  dialect: 'postgresql',
  breakpoints: true,
  strict: true,
  verbose: true
} satisfies Config
