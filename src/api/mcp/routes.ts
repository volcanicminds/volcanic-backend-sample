//
// The MCP endpoint (T-14.7 of the framework). An assistant connects with a session or an
// integration token, authenticated by the framework as on every route, and its tools act as that
// person through the API (src/services/mcp.ts).
//
// GET and DELETE were the session operations of the 2025 revisions of MCP. The server is
// stateless and answers them 405, as the 2026-07-28 revision asks; without the two routes an
// older client would get a 404, which it reads as "no MCP server here".
//
const route = (method: 'POST' | 'GET' | 'DELETE', title: string) => ({
  method,
  path: '/',
  roles: [],
  handler: 'mcp.serve',
  middlewares: ['global.isAuthenticated'],
  config: { title, description: `${title}, as the authenticated person` }
})

export default {
  config: {
    title: 'MCP',
    description: 'Model Context Protocol server over this API',
    controller: 'controller',
    enable: true,
    tags: ['MCP']
  },
  routes: [route('POST', 'MCP request'), route('GET', 'MCP stream (2025 revisions)'), route('DELETE', 'MCP session end (2025 revisions)')]
}
