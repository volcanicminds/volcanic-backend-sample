import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'
import { partnerService } from '../../../services/partner.service.js'

export async function count(req: FastifyRequest, _reply: FastifyReply) {
  return partnerService.use(req.db).count(req.userContext, req.data())
}

export async function find(req: FastifyRequest, reply: FastifyReply) {
  const { headers, records } = await partnerService.use(req.db).findAll(req.userContext, req.data())
  return reply.type('application/json').headers(headers).send(records)
}

export async function findOne(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  const partner = id ? await partnerService.use(req.db).findOne(req.userContext, id) : null
  return partner || reply.status(404).send()
}

export async function create(req: FastifyRequest, _reply: FastifyReply) {
  const { id: _id, ...data } = req.data()
  return partnerService.use(req.db).create(req.userContext, data)
}

export async function update(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  if (!id) {
    return reply.status(400).send('Missing required id parameter')
  }

  const updated = await partnerService.use(req.db).update(req.userContext, id, req.data())
  return updated || reply.status(404).send()
}

export async function remove(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  if (!id) {
    return reply.status(404).send()
  }
  return partnerService.use(req.db).remove(req.userContext, id)
}

export async function removeMany(req: FastifyRequest, reply: FastifyReply) {
  const { ids = [] } = req.data()
  if (!ids.length) {
    return reply.status(400).send()
  }
  return partnerService.use(req.db).removeMany(req.userContext, ids)
}
