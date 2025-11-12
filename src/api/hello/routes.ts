module.exports = {
  config: {
    title: 'Hello functions',
    description: 'Hello functions',
    controller: 'controller',
    enable: true,
    tags: ['Hello']
  },
  routes: [
    {
      method: 'GET',
      path: '/',
      handler: 'hello.find',
      middlewares: [],
      config: {
        title: 'Hello World',
        description: 'Hello World',
        response: {
          200: {
            description: 'Default response',
            type: 'string'
          }
        }
      }
    }
  ]
}
