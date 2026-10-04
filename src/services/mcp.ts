//
// The sample's MCP server (T-14.7 of the framework): an assistant connected to `/mcp` acts as the
// person whose credential it presents, a session or an integration token, and sees what that
// person would see.
//
// The tools reach the application only through its API, with `server.inject` and the caller's
// own cookie or Authorization header: never a service credential, never the database. So every
// rule of a route holds for the assistant too: its roles, the rows the service restricts, and the
// step-up of a `freshAuth` route, which reaches the client as the tool's error.
//
import type { FastifyRequest } from '@volcanicminds/backend'
import { createMcpHandler, defineTool, type ApiCaller } from '@volcanicminds/tools/mcp'
import { z } from 'zod'

const myProfile = defineTool({
  name: 'my_profile',
  description: 'The profile of the person using the assistant: first name, last name and language',
  input: z.object({}),
  execute: (_input, { call }) => call({ method: 'GET', path: '/profile' })
})

const findPartners = defineTool({
  name: 'find_partners',
  description: 'Partners whose name contains the given text, ignoring case; without a name, the first page of all of them',
  input: z.object({
    name: z.string().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).default(20)
  }),
  execute: ({ name, pageSize }, { call }) =>
    call({
      method: 'GET',
      path: '/partners',
      query: { ...(name ? { 'name:containsi': name } : {}), _pageSize: String(pageSize) }
    })
})

const deletePartner = defineTool({
  name: 'delete_partner',
  description: 'Deletes a partner by id. Allowed only to a person who confirmed their identity in the last minutes',
  // A uuid cannot carry a '/' or a '?': the id stays one path segment.
  input: z.object({ id: z.uuid() }),
  execute: ({ id }, { call }) => call({ method: 'DELETE', path: `/partners/${id}` })
})

/**
 * The browser origins `CORS_ORIGINS` already trusts. The wildcard is not a list of origins, so a
 * deployment without one admits no browser here: MCP clients that are not browsers send no
 * `Origin` and are not affected.
 */
function browserOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '' && origin !== '*')
}

// Built when the controller is loaded, so a missing MCP SDK or a malformed origin stops the boot
// instead of the first assistant that connects.
export const mcp = await createMcpHandler({
  name: 'volcanic-backend-sample',
  // The version of this tool surface, not of the package: it changes when a tool does.
  version: '1.0.0',
  tools: [myProfile, findPartners, deletePartner],
  allowedOrigins: browserOrigins(),
  onError: (error, tool) => {
    if (log.e) log.error(`MCP tool ${tool} failed: ${error instanceof Error ? error.stack : String(error)}`)
  }
})

// The credential headers, and only those: the API call must not depend on anything else the
// assistant's request carried.
const CREDENTIALS = ['cookie', 'authorization'] as const
/** The API as the person behind `req`: their cookie or Authorization header, through `server.inject`. */
export function callerOf(req: FastifyRequest): ApiCaller {
  const headers: Record<string, string> = {}
  for (const name of CREDENTIALS) {
    const value = req.headers[name]
    if (typeof value === 'string') headers[name] = value
  }
  return async ({ method, path, query, body }) => {
    const response = await req.server.inject({
      method,
      url: path,
      query,
      payload: body as object | undefined,
      headers,
      // Logs, tracking and rate limits see the assistant's address, not the loopback of inject.
      remoteAddress: req.ip
    })
    const json = String(response.headers['content-type'] ?? '').startsWith('application/json')
    return { status: response.statusCode, body: json ? response.json() : response.body || null }
  }
}

// The credentials go to `callerOf`, so the MCP server never holds one; the length and hop-by-hop
// headers described the message Fastify already read, and the host is in the URL.
const NOT_FORWARDED = new Set(['cookie', 'authorization', 'host', 'content-length', 'transfer-encoding', 'connection'])

/** The request as the web-standard `Request` the MCP handler takes; the body travels as `parsedBody`. */
export function toWebRequest(req: FastifyRequest): Request {
  const headers = new Headers()
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined || NOT_FORWARDED.has(name)) continue
    headers.set(name, Array.isArray(value) ? value.join(', ') : value)
  }
  return new Request(new URL(req.url, `${req.protocol}://${req.host}`), { method: req.method, headers })
}
