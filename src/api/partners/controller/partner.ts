import { FastifyReply, FastifyRequest } from '@volcanicminds/backend'
import { executeCountQuery, executeFindQuery, useWhere } from '@volcanicminds/typeorm'

export async function count(req: FastifyRequest, reply: FastifyReply) {
  return executeCountQuery(repository.partners, req.data())
}

export async function find(req: FastifyRequest, reply: FastifyReply) {
  const { headers, records } = await executeFindQuery(repository.partners, { company: true }, req.data())
  return reply.type('application/json').headers(headers).send(records)
}

export async function findOne(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  const partner = id
    ? await repository.partners.findOne({
        where: { id: id },
        relations: { company: true }
      })
    : null
  return partner || reply.status(404).send()
}

export async function create(req: FastifyRequest, reply: FastifyReply) {
  const { id, ...data } = req.data()

  const partner = await entity.Partner.create(data)
  return partner ? entity.Partner.save(partner) : reply.status(400).send(Error('Partner not creatable'))
}

export async function update(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  if (!id) {
    return reply.status(400).send('Missing required id paramenter')
  }

  const preload = await repository.partners.preload({ id: id })
  if (!preload || !preload.id) {
    return reply.status(404).send()
  }

  const { id: dataId, ...data } = req.data()
  const merged = repository.partners.merge(preload, data)
  return entity.Partner.save(merged)
}

export async function remove(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.parameters()
  if (!id) {
    return reply.status(404).send()
  }
  return entity.Partner.delete(id)
}

export async function removeMany(req: FastifyRequest, reply: FastifyReply) {
  const { ids = [], ...rest } = req.data()
  if (!ids.length) {
    return reply.status(400).send()
  }
  const result = await repository.partners.delete(useWhere({ 'id:in': ids.join(','), ...rest }))
  return result?.affected || 0
}
