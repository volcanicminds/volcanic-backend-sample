'use strict'

const { start: startServer, yn, UserManagement } = require('@volcanicminds/backend')
const { start: startDatabase, DataSource, userManager } = require('@volcanicminds/typeorm')
const { database } = require('./src/config/database')

const start = async () => {
  let db: typeof DataSource
  if (yn(process.env.START_DB, false)) {
    const options = database?.default || {}
    db = await startDatabase(options)
  }

  await startServer({ userManager: userManager as typeof UserManagement })

  !db && log.w && log.warn('Database not loaded, check START_DB property on environment')
  db &&
    log.i &&
    log.info(`Database attached at ${db.options.host || db.options.url}:${db.options.port} (${db.options.database})`)
}

start().catch((err) => console.log(err))
