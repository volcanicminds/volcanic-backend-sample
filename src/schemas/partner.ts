export const partnerBodySchema = {
  $id: 'partnerBodySchema',
  type: 'object',
  nullable: true,
  properties: {
    type: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    website: { type: 'string' }
  }
}

export const partnerSchema = {
  $id: 'partnerSchema',
  type: 'object',
  nullable: true,
  properties: {
    id: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    type: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    website: { type: 'string' }
  }
}
