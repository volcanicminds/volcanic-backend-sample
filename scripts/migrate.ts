//
// Bring the control plane to the version this code expects.
//
// A deploy step, not a boot step: v4 synchronised the schema at startup
// (`DB_SYNCHRONIZE_SCHEMA_AT_STARTUP`), which meant every restart could rewrite the shape of
// a production database with whatever the running code believed. v5 applies committed SQL,
// in order, and refuses to boot when the control plane is behind.
//
// For a fleet of tenants the command is `layer.migrateTenants({ snapshot })`, which the
// framework exposes for exactly this reason: one code path for an operator at a terminal and
// for a deploy script running unattended.
//
// The configuration comes from `preload()`, the same door `index.ts` uses, and not from
// importing `src/config/general.ts` directly: that file alone is the project's layer, without
// the framework defaults it is merged over. The schema is the configured `control.schema`, not
// `DB_SCHEMA` read a second time from the environment (T-10.20): one source for one value.
//
import { preload } from '@volcanicminds/backend'
import { start as startDataLayer } from '@volcanicminds/backend/db'

const run = async () => {
  await preload()
  const options = global.config.options
  const layer = await startDataLayer(options)
  const version = await layer.migrations.apply({ locator: options.control?.schema || 'public' })
  console.log(`control plane at version ${version || 'none applied'}`)
  await layer.shutdown()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
