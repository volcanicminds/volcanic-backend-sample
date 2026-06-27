# volcanic-backend-sample

## Embedded database (PGlite) — plug & play, zero setup

This sample is wired to run on **PGlite** out of the box: an in‑process WASM Postgres, with **no external server
and no Docker**. The engine is selected in `src/config/database.ts` via the `DB_ENGINE` env var:

- `DB_ENGINE=pglite` (default) → embedded Postgres. In‑memory by default; set `DB_PGLITE_DIR` to persist on disk.
- `DB_ENGINE=postgres` → a real Postgres server (the production‑grade choice). Set `DB_HOST/DB_PORT/...`.

Same dialect, same entities, same queries — only the engine changes. The relevant `.env` knobs (`START_DB`,
`DB_ENGINE`, `DB_SYNCHRONIZE_SCHEMA_AT_STARTUP`, `DB_PGLITE_DIR`) are documented inline in `.env`.

Optional deps (already in `package.json` as `optionalDependencies`):
`typeorm-pglite`, `@electric-sql/pglite`, `@electric-sql/pglite-pgvector`.

Full engine docs & trade‑offs: [`@volcanicminds/backend` docs/PGLITE.md](../volcanic-backend/docs/PGLITE.md).

### Runnable PoC (recommended way to see it work)

A self‑contained PoC demonstrates the embedded DB + CRUD + pgvector semantic search with **no external database**:

```bash
cd examples
npx tsx pglite-poc.ts
```

Expected output: the embedded engine starts, a uuid‑PK entity is created and queried, and a vector search returns
the nearest neighbours — all in‑process.

### Semantic search demo endpoints

`src/services/semanticSearch.ts` + `src/api/search/` expose `POST /search/index` and `POST /search/query`, built on
`PgVectorStore` from `@volcanicminds/tools`. With no AI provider configured they use a small local fallback
embedder so the demo runs offline; set `AI_EMBEDDING_PROVIDER` + a model + `EMBEDDING_DIM` for real embeddings.

> **Note on running the full server with the DB enabled.** The sample's entities use decorator metadata, which the
> `tsx` dev runner (esbuild) does **not** emit — so `npm run dev`/`start` with `START_DB=true` requires a compiled
> build instead: `npm run build && npm run start:prod`. This is a pre‑existing constraint of the sample toolchain,
> independent of the database engine. For a quick, dependency‑free demonstration use the `examples/pglite-poc.ts`
> script above (it runs under plain `tsx`).

## How to compile & run (prod)

```bash
npm run build
```

## How to run (dev)

```bash
npm run dev # or npm run start
```

## Environment sample

```ruby
NODE_ENV=development

HOST=0.0.0.0
PORT=2230

JWT_SECRET=<choose a fantastic secret>
JWT_EXPIRES_IN=1d

JWT_REFRESH=true
JWT_REFRESH_SECRET=<choose another fantastic secret>
JWT_REFRESH_EXPIRES_IN=10d

# LOG_LEVEL: trace, debug, info, warn, error, fatal
LOG_LEVEL=trace
LOG_COLORIZE=true
LOG_TIMESTAMP=true
LOG_TIMESTAMP_READABLE=true
LOG_FASTIFY=false
LOG_DB_LEVEL=warn

SWAGGER=true
# SWAGGER_HOST=localhost:2230
SWAGGER_TITLE=Volcanic Backend Sample API Documentation
SWAGGER_DESCRIPTION=List of available APIs and schemas to use
SWAGGER_VERSION=0.1.0
SWAGGER_PREFIX_URL=/api-docs

START_DB=false
```

More info on [Volcanic Backend - GitHub](https://github.com/volcanicminds/volcanic-backend)
