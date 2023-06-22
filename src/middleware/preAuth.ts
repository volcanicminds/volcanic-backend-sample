import { FastifyReply, FastifyRequest } from 'fastify'

export async function preHandler(req: FastifyRequest, res: FastifyReply) {
  log.warn('pre auth call - sample project')
}
