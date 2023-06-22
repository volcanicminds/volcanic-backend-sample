export default function load() {
  describe('Unit', async () => {
    const fs = require('fs')
    const files = fs.readdirSync(__dirname).filter((file) => !['index.ts'].includes(file))

    await files.forEach(async (file) => {
      try {
        await require(`./${file}`)()
      } catch (err) {
        log.error(err)
      }
    })
  })
}
