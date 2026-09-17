import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    userContext: UserContext
  }
}

/**
 * What the application knows about the caller, derived once per request from the token.
 *
 * It is built in a hook and not read from a global: in v4 the equivalent facts were reachable
 * through `global.connection` and friends, which is how a request could end up answering with
 * another container's data (defects D-01, D-03).
 */
export interface UserContext {
  userId: string | null
  roles: string[]
  /** The container this request works on: `control`, or the tenant's id. */
  container: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  // Injected by @volcanicminds/backend. `connection`, `entity` and `repository` were v4
  // globals and are gone: a container is now something a request is handed, never something
  // ambient that code can reach for.
  var log: any
  var server: any
  var config: any
  var roles: any
}

export {}
