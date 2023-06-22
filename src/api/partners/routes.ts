module.exports = {
  config: {
    title: 'Partners functions',
    description: 'Partners functions',
    controller: 'controller',
    enable: true,
    tags: ['Partners']
  },
  routes: [
    {
      method: 'GET',
      path: '/',
      roles: [roles.custom],
      handler: 'partner.find',
      middlewares: [],
      config: {
        title: 'Find partners',
        description: 'Get partners list',
        query: { $ref: 'getQueryParamsSchema' },
        response: {
          200: {
            description: 'Default response',
            type: 'array',
            items: { $ref: 'partnerSchema#' }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/count',
      roles: [roles.custom],
      handler: 'partner.count',
      middlewares: [],
      config: {
        title: 'Count partners',
        description: 'Count partners',
        response: {
          200: {
            description: 'Default response',
            type: 'number'
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/:id',
      roles: [roles.custom],
      handler: 'partner.findOne',
      middlewares: [],
      config: {
        title: 'Find partner',
        description: 'Get partner by id',
        params: { $ref: 'globalParamsSchema#' },
        response: {
          200: {
            description: 'Default response',
            $ref: 'partnerSchema#'
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/:id',
      roles: [roles.custom],
      handler: 'partner.update',
      middlewares: [],
      config: {
        title: 'Update partner',
        description: 'Updates a partner by id',
        params: { $ref: 'globalParamsSchema#' },
        body: { $ref: 'partnerBodySchema#' },
        response: {
          200: {
            description: 'Default response',
            $ref: 'partnerSchema#'
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/',
      roles: [roles.custom],
      handler: 'partner.create',
      middlewares: [],
      config: {
        title: 'Create a partner',
        description: 'Creates a new partner',
        body: { $ref: 'partnerBodySchema#' },
        response: {
          200: {
            description: 'Default response',
            $ref: 'partnerSchema#'
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/',
      roles: [roles.custom],
      handler: 'partner.removeMany',
      middlewares: [],
      config: {
        title: 'Delete partners',
        description: 'Deletes partners by id',
        body: { $ref: 'globalRemoveManySchema#' },
        response: {
          200: {
            description: 'Default response',
            type: 'number'
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/:id',
      roles: [roles.custom],
      handler: 'partner.remove',
      middlewares: [],
      config: {
        title: 'Delete partner',
        description: 'Deletes partner by id',
        params: { $ref: 'globalParamsSchema#' },
        response: {
          200: {
            description: 'Default response',
            $ref: 'partnerSchema#'
          }
        }
      }
    }
  ]
}
