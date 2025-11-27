export default {
  config: {
    title: 'Partners functions',
    description: 'Partners functions',
    controller: 'controller',
    enable: true,
    tags: ['Partners']
  },
  routes: [
    {
      method: 'POST',
      path: '/with',
      roles: [],
      handler: 'rawbody.withRawBody',
      middlewares: [],
      config: {
        title: 'With req.rawBody',
        description: 'With req.rawBody',
        rawBody: true,
        body: {
          type: 'object',
          nullable: true,
          properties: {
            test: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            nullable: true,
            additionalProperties: true
          }
        }
      }
    },
    {
      method: 'POST',
      roles: [],
      path: '/without',
      handler: 'rawbody.withoutRawBody',
      middlewares: [],
      config: {
        title: 'Without req.rawBody',
        description: 'Without req.rawBody',
        // rawBody: false,
        body: {
          type: 'object',
          nullable: true,
          properties: {
            test: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            nullable: true,
            additionalProperties: true
          }
        }
      }
    }
  ]
}
