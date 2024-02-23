import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'

export async function file(req: FastifyRequest, reply: FastifyReply) {
  const { ids = [], ...rest } = req.data()
  // if (!ids.length) {
  //   return reply.status(400).send()
  // }

  const data = await req.file()
  const buffer = await data?.toBuffer()

  console.log(buffer)

  return { ok: true }
}
