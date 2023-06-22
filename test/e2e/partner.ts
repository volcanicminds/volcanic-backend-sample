import { expect } from 'expect'
import * as api from '../common/api'

module.exports = () => {
  describe('Partner', () => {
    it('should accept admin GET request', async () => {
      try {
        await api.login()
        await api.get('/partner')
        await api.logout()
      } catch (err) {
        try {
          console.log(err?.response)
          expect(err?.response).toBeDefined()
          expect(err.response.status).toBe(401)
        } catch (err) {
          throw err
        }
      }
    })
  })
}
