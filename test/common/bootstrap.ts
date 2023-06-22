const { start: startServer } = require('@volcanicminds/backend')
const { start: startDatabase, DataSource, userManager } = require('@volcanicminds/typeorm')

export const DEFAULT_ADMIN_EMAIL = 'admin@user.com'
export const DEFAULT_ADMIN_PASSWORD = '71iD$k%3X#m4'
export const COMPANY2_SUPERUSER_EMAIL = 'user@volcanicminds.ai'
export const COMPANY2_SUPERUSER_PASSWORD = '44O$^yWqn@R4'

let db: typeof DataSource
let server: any

const startStuffDatabase: boolean = false
const startStuffServer: boolean = true

export async function startUp() {
  try {
    if (startStuffDatabase) {
      db = await startDatabase({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'sample',
        password: 'sample',
        database: 'sample',
        synchronize: true,
        logging: true
      })
    }

    log.level = 'trace'

    if (startStuffServer) {
      server = await startServer({ userManager: userManager })
    }

    !db && log.w && log.warn('Database not loaded')
    db &&
      log.i &&
      log.info(`Database attached at ${db.options.host || db.options.url}:${db.options.port} (${db.options.database})`)
  } catch (err) {
    console.log(err)
    throw err
  }
}

export async function uploadData() {
  if (startStuffDatabase) {
    try {
      let partner = await entity.Partner.create({
        name: 'VM first partner',
        type: 'client'
      })
      partner = await entity.Partner.save(partner)

      let user1 = await userManager.createUser({
        name: 'Admin user',
        username: 'admin_user',
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        externalId: 'admin@user.com',
        language: 'it',
        roles: ['admin', 'public']
      })
      user1 = await userManager.userConfirmation(user1)

      let user2 = await userManager.createUser({
        name: 'Custom user company2',
        username: 'super_user_company2',
        email: COMPANY2_SUPERUSER_EMAIL,
        password: COMPANY2_SUPERUSER_PASSWORD,
        externalId: 'externalIdSuperUserCompany2',
        language: 'it',
        roles: ['custom', 'public']
      })
      user2 = await userManager.userConfirmation(user2)
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

export async function tearDown() {
  if (startStuffDatabase) {
    await connection.dropDatabase()
    await db.manager.connection.close()
  }
  if (startStuffServer) {
    await server.close()
  }
  process.exit(0)
}

export function buildTasks() {
  const taskToSkip = (process.env.MOCHA_SKIP_TASK || '').toLowerCase().split(',')

  return {
    demo: !taskToSkip.includes('demo'),
    unit: !taskToSkip.includes('unit'),
    e2e: !taskToSkip.includes('e2e')
  }
}
