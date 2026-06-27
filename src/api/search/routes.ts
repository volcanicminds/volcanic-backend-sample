// Semantic-search demo routes. Showcases pgvector running on the embedded PGlite
// engine (DB_ENGINE=pglite) with zero external setup. See controller + the
// src/services/semanticSearch service.
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
