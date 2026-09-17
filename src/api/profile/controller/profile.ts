import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'
import { readProfile, writeProfile } from '../../../services/profile.service.js'
import { container } from '../../../utils/context.js'

// Whose profile is taken from the authenticated user, never from the request: a route that
// wrote the profile of the id in its body would let anyone write anyone's.
function callerId(req: FastifyRequest): string | null {
  return req.user?.id ?? null
}

export async function read(req: FastifyRequest, reply: FastifyReply) {
  const userId = callerId(req)
  if (!userId) return reply.status(403).send()
  // No row yet is not an error: a profile is written by the first thing that has something to
  // say, so a user created before the table existed simply has the defaults.
  return (await readProfile(container(req), userId)) ?? { userId, firstName: null, lastName: null, language: 'en' }
}

export async function write(req: FastifyRequest, reply: FastifyReply) {
  const userId = callerId(req)
  if (!userId) return reply.status(403).send()
  const { firstName, lastName, language } = req.bodyData() as Record<string, any>
  return writeProfile(container(req), userId, {
    ...(firstName !== undefined ? { firstName } : {}),
    ...(lastName !== undefined ? { lastName } : {}),
    ...(language !== undefined ? { language } : {})
  })
}
