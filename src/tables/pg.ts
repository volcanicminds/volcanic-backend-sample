import { pgSchema, pgTable, text, timestamp, index, check } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { uuidv7 } from '@volcanicminds/backend/db'
import { PARTNER_TYPES, USER_LANGUAGES } from './enums.js'

//
// The application's own tables, on Postgres.
//
// A factory and not a module of constants, for the same reason the framework's schema is one
// (docs/SCHEMA_V5.md): Drizzle prints the schema name into the SQL it builds, so a table
// object IS the choice of container. Building them per locator is what lets the same code
// serve every tenant without a `SET search_path` anywhere near a pooled connection.
//
const stamps = () => ({
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true })
})

// `public` is left unqualified because Drizzle refuses `pgSchema('public')`; the adapter pins
// `search_path` on the connection once, at connect time, so unqualified names still resolve
// to one place and to the same place for every request.
const tableFactory = (schemaName: string): typeof pgTable =>
  (schemaName && schemaName !== 'public' ? pgSchema(schemaName).table : pgTable) as typeof pgTable

/**
 * An `IN` list written as literal SQL.
 *
 * `sql\`... in ${list}\`` would bind the values as parameters, and drizzle-kit emits DDL with
 * the placeholders still in it — a constraint that reads `in ($1, $2)` and is refused by the
 * server. A check constraint is DDL, so its values have to be inlined.
 */
const inList = (column: string, values: readonly string[]) =>
  sql.raw(`"${column}" in (${values.map((v) => `'${v}'`).join(', ')})`)

export function appTables(schemaName: string) {
  const table = tableFactory(schemaName)

  const partner = table(
    'partner',
    {
      id: text('id').primaryKey().$defaultFn(uuidv7),
      // A text column with a check constraint, not a Postgres `enum` type: adding a value to
      // a native enum is a DDL migration that takes a lock, and this list changes with the
      // business. The check keeps the database honest anyway — a TypeScript union does not
      // survive a psql session.
      type: text('type', { enum: PARTNER_TYPES }).notNull().default('contact'),
      name: text('name'),
      email: text('email'),
      website: text('website'),
      ...stamps()
    },
    (t) => [
      index('partner_name_idx').on(t.name),
      index('partner_deleted_at_idx').on(t.deletedAt),
      check('partner_type_check', inList('type', PARTNER_TYPES))
    ]
  )

  //
  // Everything the application wants to know about a user, in the application's own table.
  //
  // In v4 this was three extra columns bolted onto the framework's `User` entity. v5 forbids
  // that (docs/SCHEMA_V5.md §6): a framework table redefined by a consumer breaks every
  // future framework migration, and the break arrives at upgrade time, on someone else's
  // deployment. The relation is one-to-one on `user.id`, and no foreign key is declared —
  // the framework owns `user`, and a constraint pointing into a table this project does not
  // migrate would make the two sets of migrations depend on each other's order.
  //
  const userProfile = table(
    'user_profile',
    {
      userId: text('user_id').primaryKey(),
      firstName: text('first_name'),
      lastName: text('last_name'),
      language: text('language', { enum: USER_LANGUAGES }).notNull().default('en'),
      ...stamps()
    },
    () => [check('user_profile_language_check', inList('language', USER_LANGUAGES))]
  )

  return { partner, userProfile }
}

export type AppTables = ReturnType<typeof appTables>
