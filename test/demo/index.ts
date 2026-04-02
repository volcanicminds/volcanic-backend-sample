export default function load() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files = fs.readdirSync(__dirname).filter((file: any) => !['index.ts'].includes(file))

  describe('Demo', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    files.forEach((file: any) => require(`./${file}`))
  })
}
