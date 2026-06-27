/* eslint-disable @typescript-eslint/no-explicit-any */
//
// Self-contained test for the semantic-search service, backed by embedded PGlite.
//
// The service only needs `global.connection.query`, so we stub it with a PGlite
// instance instead of bootstrapping the whole app. No AI provider is configured,
// so the service uses its deterministic local fallback embedder (offline). This
// verifies the MECHANISM (index -> store -> ordered search), not real semantic
// quality.
//
import { expect } from 'expect'
import { indexDocument, searchDocuments } from '../src/services/semanticSearch.js'

let pg: any

describe('semanticSearch service (PGlite, local embedder)', () => {
  before(async () => {
    // Force the offline fallback embedder.
    delete process.env.AI_PROVIDER
    delete process.env.AI_EMBEDDING_PROVIDER

    const { PGlite } = await import('@electric-sql/pglite')
    const { vector } = await import('@electric-sql/pglite-pgvector')
    pg = await PGlite.create({ extensions: { vector } })
    ;(global as any).connection = { query: (sql: string, params?: unknown[]) => pg.query(sql, params) }

    await indexDocument('cat', 'the cat sleeps on the sofa')
    await indexDocument('dog', 'the dog runs in the park')
    await indexDocument('engine', 'internal combustion engine torque')
  })

  after(async () => {
    if (pg) await pg.close()
  })

  it('creates the table + extension and indexes documents', async () => {
    const rows = await pg.query('SELECT count(*)::int AS c FROM documents')
    expect(rows.rows[0].c).toBe(3)
  })

  it('ranks the semantically nearest document first', async () => {
    const res = await searchDocuments('cat', 2)
    expect(res[0].id).toBe('cat')
    expect(res.length).toBe(2)
    expect(res[0].distance).toBeLessThanOrEqual(res[1].distance)
  })

  it('respects the k limit', async () => {
    const res = await searchDocuments('dog', 1)
    expect(res.length).toBe(1)
  })

  it('upsert updates a document in place (no duplicate)', async () => {
    await indexDocument('cat', 'the cat sleeps on the sofa', { v: 2 })
    const rows = await pg.query('SELECT count(*)::int AS c FROM documents')
    expect(rows.rows[0].c).toBe(3) // still 3, not 4
    const [top] = await searchDocuments('cat', 1)
    expect(top.id).toBe('cat')
  })
})
