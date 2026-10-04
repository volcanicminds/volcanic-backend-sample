import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'
import { callerOf, mcp, toWebRequest } from '../../../services/mcp.js'

// The framework has authenticated the request by now; the MCP server answers it as a web
// `Response`, which Fastify sends as it is, a JSON body or an event stream.
export async function serve(req: FastifyRequest, reply: FastifyReply) {
  const response = await mcp.fetch(toWebRequest(req), { caller: callerOf(req), parsedBody: req.body })
  return reply.send(response)
}
