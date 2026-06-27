import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'
import { indexDocument, searchDocuments } from '../../../services/semanticSearch.js'

export async function index(req: FastifyRequest, reply: FastifyReply) {
  const { id, content } = req.body as { id: string; content: string }
  return indexDocument(id, content)
}

export async function query(req: FastifyRequest, _reply: FastifyReply) {
  const { q, k } = req.body as { q: string; k?: number }
  const matches = await searchDocuments(q, k ?? 5)
  return { query: q, matches }
}
