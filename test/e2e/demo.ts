import { expect } from 'expect'

export default () => {
  describe('A simple test', () => {
    it('should log useless message', async () => {
      const test = [{ id: 1, message: 'This is a demo test!' }]
      expect(test?.length).toBeGreaterThan(0)
      expect(test[0].id).toBeDefined()
    })
  })
}
