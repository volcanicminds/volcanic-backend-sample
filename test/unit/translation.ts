import { expect } from 'expect'
import { TranslatedError } from '@volcanicminds/backend'

export default () => {
  describe.only('Translation', () => {
    it('should translate various messages', () => {
      try {
        let translated = (global as any).t.__('hello')
        expect(translated).toBe('Hello')
        // ... resto del test invariato ...
      } catch (err) {
        ;(global as any).log.error(err)
      }
    })

    it('should translate various errors', () => {
      // ... resto del test invariato ...
    })
  })
}
