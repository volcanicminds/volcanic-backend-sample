import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'

// Replaces the framework's `global.postAuth`, which its `/auth` routes declare: the router looks
// in this project's `src/middleware/` first. Named after WHEN it runs (after an auth route has
// answered) and exporting the Fastify hook it becomes, because the router groups middleware by
// export name.
export async function preSerialization(_req: FastifyRequest, _res: FastifyReply, payload: unknown) {
  log.warn('post auth call - sample project')
  return payload
}
