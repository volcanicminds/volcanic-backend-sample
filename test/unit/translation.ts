import { expect } from 'expect'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = () => (global as any).t

export default () => {
  describe('Translation', () => {
    it('should translate base framework messages', () => {
      expect(t().__('hello')).toBe('Hello')
      expect(t().__('greeting.placeholder.formal', 'Superman')).toBe('Hello Superman')
      expect(t().__({ phrase: 'greeting.placeholder.informal', locale: 'en' }, 'Superman')).toBe('Hi Superman')
      expect(t().__({ phrase: 'greeting.placeholder.formal', locale: 'it' }, 'Superman')).toBe('Ciao Superman')
    })

    it('should interpolate object-notation phrases', () => {
      expect(t().__({ phrase: 'complex', locale: 'en' }, { user: { firstname: 'Clark', lastname: 'Kent' } })).toBe(
        'Hello Clark Kent'
      )
      expect(t().__({ phrase: 'complex', locale: 'it' }, { user: { firstname: 'Clark', lastname: 'Kent' } })).toBe(
        'Ciao Clark Kent'
      )
    })
  })
}
