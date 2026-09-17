/* eslint-disable @typescript-eslint/no-explicit-any */
//
// Semantic search demo — pgvector via @volcanicminds/tools.
//
// The PgVectorStore from volcanic-tools is engine-agnostic: it just needs a pg-compatible
// `query` executor. In v4 that executor was `global.connection.query`, a TypeORM DataSource
// reachable from anywhere. There is no such global in v5 and that is the point: raw SQL runs
// **inside a container**, and which container is something the request is handed, never
// something a module reaches for. So the store is built per request from the handle, and
// `handle.execute` puts the statement in the right schema.
//
// Embeddings: in production you generate them with a real provider via
// `createEmbedder` / `embedText` (set AI_EMBEDDING_PROVIDER + the model + API key,
// and EMBEDDING_DIM to match the model's output size). To keep this sample
// runnable OUT OF THE BOX with no API key, we fall back to a tiny deterministic
// local embedder. DO NOT use the local embedder for real search quality.
//
import { PgVectorStore, embedText } from '@volcanicminds/tools/ai'
import { sql } from 'drizzle-orm'
import type { DataHandle } from '@volcanicminds/backend'
import { access } from '@volcanicminds/backend/db'

const DIM = Number(process.env.EMBEDDING_DIM || 16)
const hasProvider = !!(process.env.AI_EMBEDDING_PROVIDER || process.env.AI_PROVIDER)

// Deterministic bag-of-words hashing embedder — no network, fixed dimensions.
// Good enough to demo nearest-neighbour ordering; not for production.
function localEmbed(text: string): number[] {
  const v = new Array(DIM).fill(0)
  for (const token of text.toLowerCase().split(/\W+/).filter(Boolean)) {
    let h = 0
    for (let i = 0; i < token.length; i++) h = (h * 31 + token.charCodeAt(i)) >>> 0
    v[h % DIM] += 1
  }
  // L2-normalize so cosine distance behaves well.
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / norm)
}

async function embed(text: string): Promise<number[]> {
  // When a provider is configured, use real embeddings from volcanic-tools.
  if (hasProvider) return embedText(text)
  return localEmbed(text)
}

/**
 * A `(text, params)` executor on top of the handle.
 *
 * `handle.execute` speaks Drizzle's `sql` template, which binds parameters; PgVectorStore
 * speaks `$1`-style positional SQL. Splitting on the placeholders and interleaving the values
 * hands the driver the same parameters it would have received, so nothing is interpolated
 * into the statement — which is the only property that matters here.
 */
function executorFor(handle: DataHandle) {
  const { execute } = access(handle, 'semanticSearch')

  return async (text: string, params: unknown[] = []) => {
    const pieces = text.split(/\$\d+/)
    let query = sql.raw(pieces[0])
    for (let i = 0; i < params.length && i + 1 < pieces.length; i++) {
      query = sql`${query}${params[i]}${sql.raw(pieces[i + 1])}`
    }
    const result: any = await execute(query)
    // node-postgres answers with a result object, and PgVectorStore reads `.rows`.
    return Array.isArray(result) ? { rows: result } : result
  }
}

// One store per container: the table lives inside the container, so two tenants must not
// share the object that names it.
const stores = new Map<string, PgVectorStore>()

async function getStore(handle: DataHandle): Promise<PgVectorStore> {
  const { dialect, locator } = access(handle, 'semanticSearch')
  if (dialect !== 'postgres') {
    throw new Error(`Semantic search needs pgvector, which exists on Postgres; this container speaks '${dialect}'`)
  }

  const key = locator || 'public'
  const existing = stores.get(key)
  if (existing) return existing

  const store = new PgVectorStore({
    query: executorFor(handle),
    table: 'documents',
    dimensions: hasProvider ? Number(process.env.EMBEDDING_DIM || DIM) : DIM,
    distance: 'cosine'
  })
  await store.init() // CREATE EXTENSION vector + CREATE TABLE (idempotent)
  stores.set(key, store)
  return store
}

export async function indexDocument(
  handle: DataHandle,
  id: string,
  content: string,
  metadata?: Record<string, unknown>
) {
  const store = await getStore(handle)
  await store.upsert(id, content, await embed(content), metadata)
  return { id, indexed: true }
}

export async function searchDocuments(handle: DataHandle, query: string, k = 5) {
  const store = await getStore(handle)
  return store.search(await embed(query), k)
}
