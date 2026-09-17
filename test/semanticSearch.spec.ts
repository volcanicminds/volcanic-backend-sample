/* eslint-disable @typescript-eslint/no-explicit-any */
//
// Self-contained test for the semantic-search service, backed by embedded PGlite.
//
// The service now takes a **container** rather than reaching for a global connection, so the
// double here is a handle: a `db`, a `locator`, and an `execute` that runs the statement.
// PGlite is a test engine and nothing else — v5 does not offer it to consumers, because one
// connection means no isolation under concurrency, which is the class of defect the data
// layer exists to remove. It is fine here for the same reason a stub is fine anywhere: this
// test verifies the MECHANISM (index -> store -> ordered search), not the deployment.
//
// No AI provider is configured, so the service uses its deterministic local fallback
// embedder and the test runs offline.
//
import { expect } from 'expect'
import { PgDialect } from 'drizzle-orm/pg-core'
import { indexDocument, searchDocuments } from '../src/services/semanticSearch.js'

let pg: any
let handle: any

describe('semanticSearch service (PGlite, local embedder)', () => {
  before(async () => {
    // Force the offline fallback embedder.
    delete process.env.AI_PROVIDER
    delete process.env.AI_EMBEDDING_PROVIDER

    const { PGlite } = await import('@electric-sql/pglite')
    const { vector } = await import('@electric-sql/pglite-pgvector')
    pg = await PGlite.create({ extensions: { vector } })

    // `execute` receives what Drizzle builds, so the double renders it back to text and
    // parameters exactly as a driver would. Nothing is interpolated into the statement.
    const dialect = new PgDialect()
    handle = {
      kind: 'control',
      dialect: 'postgres',
      locator: 'public',
      db: {},
      tables: {},
      execute: async (query: any) => {
        const { sql, params } = dialect.sqlToQuery(query)
        return pg.query(sql, params)
      },
      transaction: async (fn: any) => fn({})
    }

    await indexDocument(handle, 'cat', 'the cat sleeps on the sofa')
    await indexDocument(handle, 'dog', 'the dog runs in the park')
    await indexDocument(handle, 'engine', 'internal combustion engine torque')
  })

  after(async () => {
    if (pg) await pg.close()
  })

  it('creates the table + extension and indexes documents', async () => {
    const rows = await pg.query('SELECT count(*)::int AS c FROM documents')
    expect(rows.rows[0].c).toBe(3)
  })

  it('ranks the semantically nearest document first', async () => {
    const res = await searchDocuments(handle, 'cat', 2)
    expect(res[0].id).toBe('cat')
    expect(res.length).toBe(2)
    expect(res[0].distance).toBeLessThanOrEqual(res[1].distance)
  })

  it('respects the k limit', async () => {
    const res = await searchDocuments(handle, 'dog', 1)
    expect(res.length).toBe(1)
  })

  it('upsert updates a document in place (no duplicate)', async () => {
    await indexDocument(handle, 'cat', 'the cat sleeps on the sofa', { v: 2 })
    const rows = await pg.query('SELECT count(*)::int AS c FROM documents')
    expect(rows.rows[0].c).toBe(3) // still 3, not 4
    const [top] = await searchDocuments(handle, 'cat', 1)
    expect(top.id).toBe('cat')
  })
})
