'use strict'

//
// Where the data lives (docs/CONFIGURATION_V5.md §1).
//
// v4 had `options.multi_tenant` with an `enabled` flag that could contradict the strategy
// beside it. v5 has two declared blocks and no flag: `control` says where the platform's own
// data is, and **declaring `tenants` is what turns tenancy on**. Absent means single tenant,
// which is what this sample is.
//
// Postgres, and only Postgres. v4 defaulted to embedded PGlite for a zero-setup demo; v5 does
// not offer PGlite to consumers, because one connection means no isolation under concurrency,
// which is the class of defect the v5 data layer exists to remove. SQLite is a supported
// engine of the framework but has no migration set yet, and a sample cannot ship a path that
// has no schema to apply. `docker run -p 5432:5432 postgres:16-alpine` is the setup.
//
export default {
  name: 'general',
  options: {
    reset_external_id_on_login: false,
    scheduler: false,

    // The admin console reads `GET /admin/manifest` (T-10.22). On by default in this sample
    // because the sample is also what `volcanic-admin` is tried against; a real project turns it
    // on only where a console exists, and grants the `manifest` capability to the roles that
    // operate it and to nobody else, since the manifest lists every route and every role code.
    // `SAMPLE_MANIFEST=off` spegne la superficie della console, e con essa `GET /admin/manifest` e
    // `GET /system/manifest`: serve a provare che il backend gira anche senza admin, che è una
    // combinazione supportata e non un caso di ripiego.
    manifest: { enabled: process.env.SAMPLE_MANIFEST !== 'off' },

    control: {
      engine: 'postgres' as const,
      url: process.env.DATABASE_URL,
      // Explicit, never inferred: the schema a query lands in is not something to discover
      // from a connection's `search_path`.
      schema: process.env.DB_SCHEMA || 'public',
      pool: { max: Number(process.env.DB_POOL_MAX || 10) }
    },

    // `SAMPLE_TENANTS=header` makes this a multi-tenant deployment, one schema per tenant and the
    // tenant in `x-tenant-id`. Nothing else changes: the services already work on whichever
    // container the request resolved, because they are handed one. It is an environment switch
    // and not a commented block because the same sample is what `volcanic-admin` is tried
    // against, on a customer console and on the platform console.
    ...(process.env.SAMPLE_TENANTS === 'header'
      ? {
          tenants: {
            strategy: 'schema' as const,
            engine: 'postgres' as const,
            resolver: 'header' as const,
            headerKey: 'x-tenant-id'
          }
        }
      : {})
  }
}
