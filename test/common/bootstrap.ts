import { start as startServer } from '@volcanicminds/backend'
import { userManager } from '@volcanicminds/typeorm'

export const DEFAULT_ADMIN_EMAIL = 'admin@user.com'
export const DEFAULT_ADMIN_PASSWORD = '71iD$k%3X#m4'
export const COMPANY2_SUPERUSER_EMAIL = 'user@volcanicminds.ai'
export const COMPANY2_SUPERUSER_PASSWORD = '44O$^yWqn@R4'

let server: { close: () => Promise<void> }

const startStuffServer: boolean = true

export async function startUp() {
  try {
    log.level = 'trace'

    if (startStuffServer) {
      server = await startServer({ userManager: userManager })
    }
  } catch (err) {
    console.log(err)
    throw err
  }
}

export async function uploadData() {
  // Logica commentata rimossa per brevità se non serve
}

export async function tearDown() {
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
