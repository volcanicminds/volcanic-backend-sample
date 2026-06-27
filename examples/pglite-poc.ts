/* eslint-disable @typescript-eslint/no-explicit-any */
//
// Runnable PGlite PoC — embedded Postgres + pgvector via the Volcanic stack.
//
//   cd examples && npx tsx pglite-poc.ts
//
// Run it from THIS folder: the backend's entity loader scans `cwd/src/entities`,
// and the sample's decorated entities require a tsc build (tsx does not emit
// decorator metadata). Running from `examples/` keeps that scan empty so the PoC
// works with plain `tsx`. The app server itself runs from a compiled build
// (`npm run build && npm run start:prod`).
//
import 'reflect-metadata'
import { EntitySchema } from 'typeorm'
import { start, closeEmbedded } from '@volcanicminds/backend/typeorm'
import { PgVectorStore } from '@volcanicminds/tools/ai'

// A decorator-free entity so the PoC runs under plain tsx.
const Note = new EntitySchema<any>({
  name: 'Note',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    title: { type: String },
    done: { type: Boolean, default: false }
  }
})

async function main() {
  // 1) Embedded engine: zero setup, no Docker. `vector: true` loads pgvector.
  const ds: any = await start({
    type: 'pglite',
    vector: true,
    synchronize: false,
    logging: false,
    entities: [Note]
  })
  await ds.synchronize()
  console.log('✅ embedded PGlite started:', (global as any).embeddedDatabase)

  // 2) Standard TypeORM — uuid PKs (uuid-ossp is auto-enabled), CRUD, booleans.
  const repo = ds.getRepository(Note)
  await repo.save([repo.create({ title: 'buy milk' }), repo.create({ title: 'ship release', done: true })])
  const open = await repo.findBy({ done: false })
  console.log('✅ CRUD + boolean query → open notes:', open.map((n: any) => n.title))

  // 3) Semantic search with pgvector, via @volcanicminds/tools.
  const store = new PgVectorStore({
    query: (sql: string, params?: unknown[]) => ds.query(sql, params),
    table: 'poc_embeddings',
    dimensions: 3,
    distance: 'cosine'
  })
  await store.init()
  await store.upsertMany([
    { id: 'cat', content: 'a small domestic cat', embedding: [1, 0, 0] },
    { id: 'dog', content: 'a friendly dog', embedding: [0.9, 0.1, 0] },
    { id: 'car', content: 'a fast sports car', embedding: [0, 1, 0] }
  ])
  const matches = await store.search([1, 0, 0], 2)
  console.log('✅ vector search (nearest to the "animal" axis):', matches.map((m) => `${m.id}(${m.distance.toFixed(3)})`))

  await ds.destroy()
  await closeEmbedded()
  console.log('✅ done — PoC completed with NO external database.')
}

main().catch((err) => {
  console.error('PoC failed:', err)
  process.exit(1)
})
