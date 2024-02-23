export const uploadBodySchema = {
  $id: 'uploadBodySchema',
  type: 'object',
  nullable: true,
  properties: {
    fileName: { type: 'string' },
    file: { type: 'string', format: 'binary' }
  }
}

export const uploadSchema = {
  $id: 'uploadSchema',
  type: 'object',
  nullable: true,
  properties: {
    ok: { type: 'boolean' }
  }
}
