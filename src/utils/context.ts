import type { FastifyRequest } from '@volcanicminds/backend'
import type { UserContext } from '../../types/index.js'

/**
 * The container this request works on.
 *
 * It is the framework's own function, re-exported under the name this project uses, and not a
 * copy: the copy that lived here read `req.tenant ?? req.control`, which is one character of
 * syntax and a different rule. That form gives a tenant route that lost its container the
 * control plane, which is exactly the fallback the v5 data layer was rewritten to remove
 * (D-01, D-06). `dataContext` refuses instead, with `NoDataContextError`.
 *
 * Three cases, and none is a fallback: a route that declared `scope: 'control'` gets the
 * control plane because it asked; a deployment with no `tenants` block gets it because that is
 * where its data lives; a tenant route gets its container or an error.
 */
export { dataContext as container } from '@volcanicminds/backend'

/** What the application knows about the caller. Derived from the token, never from a header. */
export function userContext(req: FastifyRequest): UserContext {
  return {
    userId: req.user?.id ?? null,
    roles: req.roles?.() ?? [],
    container: req.tenantInfo?.id ? `tenant:${req.tenantInfo.id}` : 'control'
  }
}
