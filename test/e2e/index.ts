import demo from './demo.js'
import login from './login.js'
import mcp from './mcp.js'

export default function load() {
  describe('e2e', () => {
    demo()
    login()
    mcp()
  })
}
