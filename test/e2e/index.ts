export default function load() {
  describe('e2e', async () => {
    const fs = require('fs')
    const files = fs.readdirSync(__dirname).filter((file: any) => !['index.ts'].includes(file))

    await files.forEach(async (file: any) => {
      try {
        await require(`./${file}`)()
      } catch (err) {
        log.error(err)
      }
    })
  })
}
