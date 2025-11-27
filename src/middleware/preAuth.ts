import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'

export async function preHandler(req: FastifyRequest, res: FastifyReply) {
  log.warn('pre auth call - sample project')
}
