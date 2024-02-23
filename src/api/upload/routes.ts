module.exports = {
  config: {
    title: 'Upload functions',
    description: 'Upload functions',
    controller: 'controller',
    enable: true,
    tags: ['Upload']
  },
  routes: [
    {
      method: 'POST',
      path: '/file',
      roles: [],
      handler: 'upload.file',
      middlewares: [],
      config: {
        title: 'Upload file',
        description: 'Upload a sample file',
        consumes: ['multipart/form-data'],
        query: { $ref: 'getQueryParamsSchema' },
        body: { $ref: 'uploadBodySchema#' },
        response: {
          200: {
            description: 'Default response',
            $ref: 'uploadSchema#'
          }
        }
      }
    }
  ]
}
