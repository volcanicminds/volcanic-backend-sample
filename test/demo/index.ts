export default function load() {
  const fs = require('fs')
  const files = fs.readdirSync(__dirname).filter((file) => !['index.ts'].includes(file))

  describe('Demo', () => {
    files.forEach((file) => require(`./${file}`))
  })
}
