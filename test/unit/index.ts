import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function load() {
  describe('Unit', async () => {
    const files = fs.readdirSync(__dirname).filter((file: any) => !['index.ts'].includes(file))

    for (const file of files) {
      try {
        const module = await import(`./${file}`)
        if (module.default) await module.default()
      } catch (err) {
        log.error(err)
      }
    }
  })
}
