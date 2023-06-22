export const userBodySchema = {
  $id: 'userBodySchema',
  type: 'object',
  nullable: true,
  properties: {
    email: { type: 'string' }
  }
}

export const userSchema = {
  $id: 'userSchema',
  type: 'object',
  nullable: true,
  properties: {
    id: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    email: { type: 'string' }
  }
}
