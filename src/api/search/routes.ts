// Semantic-search demo routes. Showcases pgvector, on the container the request resolved:
// the vector table lives inside that container like every other table, so two tenants never
// search each other's documents. See the controller and src/services/semanticSearch.
//
// Postgres only — pgvector is a Postgres extension, and the service says so out loud rather
// than degrading into a slower approximation.
export default {
  config: {
    title: 'Semantic search (pgvector)',
    description: 'Index documents and search them by meaning using pgvector',
    controller: 'controller',
    enable: true,
    tags: ['Search']
  },
  routes: [
    {
      method: 'POST',
      path: '/index',
      handler: 'search.index',
      middlewares: [],
      config: {
        title: 'Index a document',
        description: 'Stores a document and its embedding',
        body: {
          type: 'object',
          required: ['id', 'content'],
          properties: {
            id: { type: 'string' },
            content: { type: 'string' }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/query',
      handler: 'search.query',
      middlewares: [],
      config: {
        title: 'Search documents',
        description: 'Returns the nearest documents to the query text',
        body: {
          type: 'object',
          required: ['q'],
          properties: {
            q: { type: 'string' },
            k: { type: 'integer', default: 5 }
          }
        }
      }
    }
  ]
}
