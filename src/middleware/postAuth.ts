import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'

export async function preSerialization(req: FastifyRequest, res: FastifyReply, payload) {
  log.warn('post auth call - sample project')
  return payload
}
