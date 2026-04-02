import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'

export async function preHandler(_req: FastifyRequest, _res: FastifyReply) {
  log.warn('pre auth call - sample project')
}
