import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'

export async function withoutRawBody(req: FastifyRequest, reply: FastifyReply) {
  const body = req.data()
  const rawBody = req.rawBody || null

  return reply.status(200).send({
    body: body,
    withRawBody: !!rawBody,
    rawBody: rawBody
  })
}

export async function withRawBody(req: FastifyRequest, reply: FastifyReply) {
  const body = req.data()
  const rawBody = req.rawBody || null

  return reply.status(200).send({
    body: body,
    withRawBody: !!rawBody,
    rawBody: rawBody
  })
}
