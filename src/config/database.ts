import { Database } from '@volcanicminds/backend/typeorm'
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm'

class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return embeddedPrefixes
      .concat(customName || propertyName)
      .map((s, i) => (i > 0 ? s.replace(/^(.)/, (c) => c.toUpperCase()) : s))
      .join('')
  }
}

const namingStrategy = new CustomNamingStrategy()

// ---------------------------------------------------------------------------
// Database engine selection (DB_ENGINE)
//
//   pglite   -> embedded WASM Postgres. ZERO setup: no server, no Docker.
//               Perfect for local dev, demos, CI and quick prototypes.
//               This is the default so the sample runs out-of-the-box.
//   postgres -> a real Postgres server (the professional / production choice).
//               Point it at a local install or a Docker container.
//
// Switch with `DB_ENGINE=postgres` in .env. Everything else (entities, queries,
// services, multi-tenant) is identical: same SQL dialect, same TypeORM code.
// See the backend docs: docs/PGLITE.md
// ---------------------------------------------------------------------------
const engine = (process.env.DB_ENGINE || 'pglite').toLowerCase()

// Embedded PGlite — plug & play. `dataDir` omitted => in-memory (data is lost on
// restart). Set DB_PGLITE_DIR to a folder to persist on disk. `vector: true`
// loads pgvector so the semantic-search demo (see src/services/semanticSearch)
// works on the embedded engine too.
const pglite = {
  type: 'pglite',
  dataDir: process.env.DB_PGLITE_DIR || undefined,
  vector: true,
  synchronize: true,
  logging: true,
  namingStrategy
}

// Real Postgres — the production-grade option (install locally or via Docker).
const postgres = {
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || 'sample',
  password: process.env.DB_PASSWORD || 'sample',
  database: process.env.DB_NAME || 'sample',
  synchronize: true,
  logging: true,
  namingStrategy
}

export const database: Database = {
  default: engine === 'postgres' ? postgres : pglite
}
