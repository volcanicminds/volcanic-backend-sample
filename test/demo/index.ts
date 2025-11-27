export default function load() {
  const fs = require('fs')
  const files = fs.readdirSync(__dirname).filter((file: any) => !['index.ts'].includes(file))

  describe('Demo', () => {
    files.forEach((file: any) => require(`./${file}`))
  })
}
