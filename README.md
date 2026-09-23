# volcanic-backend-sample

Executable documentation for `@volcanicminds/backend` **v5**. Everything here is a working
answer to a question the migration guide raises: where the tables go, how a service reaches
the right container, what a controller is handed, how the schema is applied.

## What changed from v4, in one screen

| | v4 | v5 |
|---|---|---|
| Data layer | `@volcanicminds/backend/typeorm`, TypeORM entities with decorators | `@volcanicminds/backend/db`, Drizzle tables in `src/tables/` |
| Engine | embedded PGlite by default | **Postgres**. PGlite is not offered to consumers: one connection cannot isolate anything under concurrency |
| Schema | `synchronize: true` at boot | committed SQL under `migrations/`, applied by `npm run db:migrate` |
| The container | `req.db`, with a global connection to fall back on | `req.tenant ?? req.control`, and nothing to fall back on |
| Extra user fields | three columns bolted onto the framework's `User` entity | a `user_profile` table of this project's own |
| Bootstrap | `startDatabase(config)` then `start({ userManager })` | `preload()`, `startDataLayer()`, `startServer({ ...layer, mfaManager, challengeDeliveryManager })` — in that order |
| Login | `POST /auth/login`, then `/auth/mfa/verify` with a temporary token | a flow: `POST /auth/flow/start`, then `/auth/flow/step` while a stage is owed |

The full list of breaks, with the reasoning, is in
[`docs/MIGRATION_V4_V5.md`](../volcanic-backend/docs/MIGRATION_V4_V5.md).

## Running it

A Postgres 16 and two commands:

```bash
docker run -d --name sample-pg \
  -e POSTGRES_USER=sample -e POSTGRES_PASSWORD=sample -e POSTGRES_DB=sample \
  -p 5432:5432 postgres:16-alpine

npm install
npm run db:migrate   # applies the framework's migrations, then this project's
npm run dev          # or npm start
```

`npm run db:migrate` is a **deploy step**, not a boot step. v4 rebuilt the schema at startup
from whatever the running code believed; v5 applies committed SQL in order and refuses to boot
when the control plane is behind.

The first boot seeds the founder from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, and reads those
variables at no other time. Without an identity and without `ADMIN_EMAIL` the instance refuses
to start: an instance nobody can log into is not a running instance.

## Developing against a local framework checkout

`package.json` points at `file:../volcanic-backend`, so this project runs against the working
copy next door. `npm install` links it, and a `postinstall` script
(`scripts/link-peers.mjs`) collapses the peer dependencies — `drizzle-orm`, `pg`, `bcrypt` —
onto that checkout's copies.

That step exists because a `file:` dependency is a symlink to a checkout that has its own
`node_modules`, and Node resolves through the realpath: without it there are two copies of
Drizzle at the same version, a table built by one is a foreign object to the other, and the
error names two identical-looking paths. Installed from the registry the framework brings no
`node_modules` of its own and the problem does not exist.

## Logging in

The login is a flow ([`docs/AUTH_FLOW_V5.md`](../volcanic-backend/docs/AUTH_FLOW_V5.md)), and
`src/config/authFlows.ts` says which one: a password, or a code sent to the address on file; an
administrator may only use the password; TOTP for whoever enrolled it.

```bash
# cookie mode, the default: the flow credential travels in the auth_flow cookie
curl -c jar -b jar -X POST localhost:2230/auth/flow/start -H 'content-type: application/json' \
  -d '{"method":"email-otp","email":"someone@example.com"}'   # 202, a code is sent
curl -c jar -b jar -X POST localhost:2230/auth/flow/step  -H 'content-type: application/json' \
  -d '{"method":"email-otp","code":"12345678"}'               # 200, the session in the cookies
```

The two managers that make this work are the application's, in `src/services/auth.ts`: TOTP from
`@volcanicminds/tools/mfa`, and the delivery of sign-in codes on `@volcanicminds/tools/mailer` when
`SMTP_HOST` is set (`SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`). Without
`SMTP_HOST`, in development the codes go to the log and to an in-memory outbox the tests read; in
production there is no delivery, and the framework refuses to boot a flow that lists `email-otp`.
Users created by an administrator are active at once (`allow_admin_create_confirmed_users`), because
a code is only ever sent to a confirmed address.

## Where things are

| | |
|---|---|
| `src/tables/pg.ts` | this project's tables, built **per container**: Drizzle prints the schema name into the SQL, so a table object is the choice of container |
| `src/tables/index.ts` | `tablesFor(handle)`, with a cache keyed by the locator — the key matters, two tenants differ in nothing else |
| `src/services/base.service.ts` | the data-access pattern: bound to a handle, refusing to work without one, with a row-level-security hook the URL cannot argue with |
| `src/services/profile.service.ts` | the application's own facts about a user, in the application's own table |
| `src/api/profile/` | `GET` and `PUT /profile`: the caller's own profile, the user id taken from the token |
| `src/api/partners/` | thin controllers over the service, with the `manifest` hints the admin console reads |
| `src/services/semanticSearch.ts` | pgvector, inside the container the request resolved |
| `src/config/authFlows.ts`, `src/services/auth.ts` | how people log in, and the two managers the application brings for it |
| `migrations/` | two sets, `control` and `tenant`, each in its dialect folder (`migrations/<set>/pg`), generated by `npm run db:generate` |

## Multi-tenant, and the console surface

`SAMPLE_TENANTS=header` makes this a multi-tenant deployment: one schema per tenant, the tenant in
`x-tenant-id`. Nothing else in this project changes, because the services already work on whichever
container the request resolved, being handed one instead of reaching for it.

`SAMPLE_MANIFEST=off` turns the admin console surface off, and with it `GET /admin/manifest` and the
platform's `GET /system/manifest`.

The two switches are independent on purpose: single or multi tenant, with or without a console, are
all supported shapes, and all four boot from here.

## Semantic search demo

`POST /search/index` and `POST /search/query`, built on `PgVectorStore` from
`@volcanicminds/tools`. With no AI provider configured they use a small local fallback embedder
so the demo runs offline; set `AI_EMBEDDING_PROVIDER`, a model and `EMBEDDING_DIM` for real
embeddings. Postgres only — pgvector is a Postgres extension, and the service says so rather
than degrading into a slower approximation.

## Scripts

```bash
npm run dev              # tsx watch
npm start                # tsx
npm run build && npm run prod

npm run db:generate      # regenerate migrations/control from src/tables/entry/control.pg.ts
npm run db:generate:tenant
npm run db:migrate

npm test                 # the suite
npm run test:search      # the semantic-search service, on embedded PGlite as a test double
npm run check-all        # lint + type-check
```

More info on [Volcanic Backend - GitHub](https://github.com/volcanicminds/volcanic-backend)
