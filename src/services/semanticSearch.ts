/* eslint-disable @typescript-eslint/no-explicit-any */
//
// Semantic search demo — pgvector via @volcanicminds/tools.
//
// The PgVectorStore from volcanic-tools is engine-agnostic: it just needs a
// pg-compatible `query` executor. Here we hand it the TypeORM DataSource created
// by the backend (`global.connection`), so the SAME code runs on embedded PGlite
// (DB_ENGINE=pglite, vector:true) and on a real Postgres with pgvector installed.
//
// Embeddings: in production you generate them with a real provider via
// `createEmbedder` / `embedText` (set AI_EMBEDDING_PROVIDER + the model + API key,
// and EMBEDDING_DIM to match the model's output size). To keep this sample
// runnable OUT OF THE BOX with no API key, we fall back to a tiny deterministic
// local embedder. DO NOT use the local embedder for real search quality.
//
import { PgVectorStore, embedText } from '@volcanicminds/tools/ai'

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

let store: PgVectorStore | null = null
async function getStore(): Promise<PgVectorStore> {
  if (!store) {
    store = new PgVectorStore({
      query: (sql: string, params?: unknown[]) => (global as any).connection.query(sql, params),
      table: 'documents',
      dimensions: hasProvider ? Number(process.env.EMBEDDING_DIM || DIM) : DIM,
      distance: 'cosine'
    })
    await store.init() // CREATE EXTENSION vector + CREATE TABLE (idempotent)
  }
  return store
}

export async function indexDocument(id: string, content: string, metadata?: Record<string, unknown>) {
  const s = await getStore()
  await s.upsert(id, content, await embed(content), metadata)
  return { id, indexed: true }
}

export async function searchDocuments(query: string, k = 5) {
  const s = await getStore()
  return s.search(await embed(query), k)
}
