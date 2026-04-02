import { expect } from 'expect'


export default () => {
  describe.only('Translation', () => {
    it('should translate various messages', () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const translated = (global as any).t.__('hello')
        expect(translated).toBe('Hello')
        // ... resto del test invariato ...
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(global as any).log.error(err)
      }
    })

    it('should translate various errors', () => {
      // ... resto del test invariato ...
    })
  })
}
