'use strict'

import { preload, start as startServer } from '@volcanicminds/backend'
import { start as startDataLayer } from '@volcanicminds/backend/db'
import { challengeDeliveryManager, mfaManager } from './src/services/auth.js'

//
// The v5 bootstrap, in three lines and one order that matters.
//
// The data layer is started FIRST and returns the managers, which are then handed to the
// server as decorators. In v4 the server could start without a database and the managers were
// imported as module-level singletons from `@volcanicminds/backend/typeorm`; here they are
// values a caller owns, which is what makes a different implementation a parameter rather
// than a patch.
//
// `preload()` comes first, and it is not optional. It is what reads `config/general.ts` into
// `global.config`, and the data layer reads the `control` and `tenants` blocks from there.
// Without it `startDataLayer()` finds no configuration and quietly falls back to its own
// defaults — a different database, reached without an error, which is the worst shape a
// misconfiguration can take. `startServer()` calls it too, but by then the data layer has
// already opened its pool.
//
const start = async () => {
  await preload()

  const layer = await startDataLayer()

  // The schema of the control plane, brought to the version this code expects. It is a deploy
  // step in production (`npm run db:migrate`), and it runs here so that `npm start` on a clean
  // machine gives a working instance rather than a stack trace about a missing table. The
  // schema is the configured one, not `DB_SCHEMA` read again from the environment (T-10.20).
  await layer.migrations.apply({ locator: global.config.options.control?.schema || 'public' })

  // The managers that keep data come from the layer; the two that do something come from the
  // application: the TOTP computation, and the delivery of sign-in codes (src/services/auth.ts).
  const server = await startServer({ ...layer, mfaManager, challengeDeliveryManager: challengeDeliveryManager() })

  if (log.i) log.info(`Sample up on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 2230}`)
  return server
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
