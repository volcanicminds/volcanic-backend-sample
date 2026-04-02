export default function load() {
  describe('e2e', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    const files = fs.readdirSync(__dirname).filter((file: unknown) => !['index.ts'].includes(file as string))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await files.forEach(async (file: any) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        await require(`./${file}`)()
      } catch (err) {
        log.error(err)
      }
    })
  })
}
