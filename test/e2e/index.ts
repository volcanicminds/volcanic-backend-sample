import demo from './demo.js'
import login from './login.js'

export default function load() {
  describe('e2e', () => {
    demo()
    login()
  })
}
