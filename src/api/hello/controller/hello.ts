import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'

export async function find(_req: FastifyRequest, _reply: FastifyReply) {
  return 'Hello World'
}
