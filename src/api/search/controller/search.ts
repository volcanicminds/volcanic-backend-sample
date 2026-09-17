import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'
import { indexDocument, searchDocuments } from '../../../services/semanticSearch.js'
import { container } from '../../../utils/context.js'

export async function index(req: FastifyRequest, _reply: FastifyReply) {
  const { id, content } = req.bodyData() as { id: string; content: string }
  return indexDocument(container(req), id, content)
}

export async function query(req: FastifyRequest, _reply: FastifyReply) {
  const { q, k } = req.bodyData() as { q: string; k?: number }
  const matches = await searchDocuments(container(req), q, k ?? 5)
  return { query: q, matches }
}
