import { preload, start as startServer } from '@volcanicminds/backend'
import { start as startDataLayer } from '@volcanicminds/backend/db'

// The founder the application seeds at boot, read from where the application reads it
// (`ADMIN_EMAIL`/`ADMIN_PASSWORD`, lib/loader/genesis.ts). Hard-coded copies stood here and had
// drifted from `.env`, so a login helper built on them could never log in (T-10.25).
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@user.com'
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

let server: { close: () => Promise<void> }
let layer: { migrations: any; shutdown: () => Promise<void> } | null = null

const startStuffServer: boolean = true

export async function startUp() {
  try {
    if (startStuffServer) {
      // The same order as index.ts, and for the same reason: the managers are values the data
      // layer returns, not singletons a module imports. A test that assembled them differently
      // would be testing an application the sample does not ship.
      await preload()
      layer = await startDataLayer()
      await layer.migrations.apply({ locator: global.config.options.control?.schema || 'public' })
      server = await startServer(layer as never)
    }
  } catch (err) {
    console.log(err)
    throw err
  }
}

export async function tearDown() {
  if (startStuffServer && server) {
    await server.close()
  }
  // Give the pools back explicitly. Mocha runs with --exit, but a suite that relies on that
  // to close its connections is a suite that hides a leak in the application.
  if (layer) {
    await layer.shutdown()
    layer = null
  }
  // No process.exit here: it would mask test failures (always exit 0) and
  // truncate the reporter. Mocha is run with --exit to close lingering handles.
}

export function buildTasks() {
  const taskToSkip = (process.env.MOCHA_SKIP_TASK || '').toLowerCase().split(',')

  return {
    demo: !taskToSkip.includes('demo'),
    unit: !taskToSkip.includes('unit'),
    e2e: !taskToSkip.includes('e2e')
  }
}
