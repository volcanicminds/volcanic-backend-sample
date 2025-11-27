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

  !db && log.w && log.warn('Database not loaded, check START_DB property on environment')
  db &&
    log.i &&
    log.info(
      `Database attached at ${(db.options as any).host || (db.options as any).url}:${(db.options as any).port} (${
        (db.options as any).database
      })`
    )
}

start().catch((err) => console.log(err))
