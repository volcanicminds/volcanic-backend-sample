'use strict'

import { start as startServer, yn } from '@volcanicminds/backend'
import { start as startDatabase, userManager, DataSource } from '@volcanicminds/typeorm'
import { database } from './src/config/database.js'

const start = async () => {
  let db: DataSource | null = null
  if (yn(process.env.START_DB, false)) {
    const options = database?.default || {}
    db = await startDatabase(options)
  }

  await startServer({ userManager: userManager })

  if (!db && log.w) log.warn('Database not loaded, check START_DB property on environment')
  if (db && log.i) {
    const options = db.options as unknown as Record<string, unknown>
    log.info(`Database attached at ${options.host || options.url}:${options.port} (${options.database})`)
  }
}

start().catch((err) => console.log(err))
