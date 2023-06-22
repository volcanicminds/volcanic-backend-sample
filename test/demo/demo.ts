import { expect } from 'expect'

module.exports = () => {
  describe('A simple test', () => {
    it('should log useless message', async () => {
      // log.debug('log debug not allowed')
      // log.info('log info not allowed')
      // log.warn('log warn allowed')
      // log.error('log error allowed')

      const test = await repository.partners.find()
      expect(test?.length).toBeGreaterThan(0)
      expect(test[0].id).toBeDefined()
    })
  })
}
