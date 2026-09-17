import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'
import { partnerService } from '../../../services/partner.service.js'
import { container, userContext } from '../../../utils/context.js'

//
// Thin controllers: read the request, hand the container to the service, answer.
//
// The change from v4 is `container(req)` where `req.db` used to be. It is not a rename: v4's
// `req.db` was an EntityManager that a service could do without, falling back to the global
// connection; here there is no global to fall back to, and a request that lost its container
// fails loudly instead of reading someone else's data.
//
export async function count(req: FastifyRequest, _reply: FastifyReply) {
  return partnerService.on(container(req)).count(userContext(req), req.data())
}

export async function find(req: FastifyRequest, reply: FastifyReply) {
  const { headers, records } = await partnerService.on(container(req)).findAll(userContext(req), req.data())
  return reply.type('application/json').headers(headers).send(records)
}

export async function findOne(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  const partner = id ? await partnerService.on(container(req)).findOne(userContext(req), id) : null
  return partner || reply.status(404).send()
}

export async function create(req: FastifyRequest, _reply: FastifyReply) {
  // Only the body: a create steered by the query string is a create whose values can be put
  // in a link (`req.data()` merges the two since v5, so the distinction is now expressible).
  const { id: _id, ...data } = req.bodyData()
  return partnerService.on(container(req)).create(userContext(req), data)
}

export async function update(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  if (!id) {
    return reply.status(400).send('Missing required id parameter')
  }

  const updated = await partnerService.on(container(req)).update(userContext(req), id, req.bodyData())
  return updated || reply.status(404).send()
}

export async function remove(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  if (!id) {
    return reply.status(404).send()
  }
  // A soft delete: the row keeps its place and stops being read. Saying so in the body is
  // the point — v4 answered with the driver's `DeleteResult` through a schema that described
  // a partner, so the response serialized to `{}` and told the caller nothing.
  const { affected } = await partnerService.on(container(req)).remove(userContext(req), id)
  if (!affected) return reply.status(404).send()
  return { id, deleted: true }
}

export async function removeMany(req: FastifyRequest, reply: FastifyReply) {
  const { ids = [] } = req.bodyData()
  if (!ids.length) {
    return reply.status(400).send()
  }
  return partnerService.on(container(req)).removeMany(userContext(req), ids)
}

