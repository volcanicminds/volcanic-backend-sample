import { createHmac } from 'node:crypto'
import { expect } from 'expect'
import { flow, login, logout, get, post, useToken } from '../common/api.js'
import { devOutbox } from '../../src/services/auth.js'

//
// The login as a flow (T-12.44), over HTTP, with the flows of config/authFlows.ts: a password or a
// code sent by email to identify, TOTP for whoever enrolled it, and an administrator who may only
// use the password.
//

/** RFC 6238 on SHA-1, 30 s, 6 digits: what an authenticator app shows, `offset` steps away from now. */
function totp(secret: string, offset = 0): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const char of secret.replace(/=+$/, '')) bits += alphabet.indexOf(char).toString(2).padStart(5, '0')
  const key = Buffer.from(bits.match(/.{8}/g)!.map((byte) => parseInt(byte, 2)))
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000) + offset))
  const mac = createHmac('sha1', key).update(counter).digest()
  const at = mac[mac.length - 1] & 0x0f
  return String((mac.readUInt32BE(at) & 0x7fffffff) % 1_000_000).padStart(6, '0')
}

/** The deliveries run after the response: give them their turn before reading the outbox. */
const delivered = () => new Promise((resolve) => setImmediate(resolve))

const lastCodeFor = (to: string) => [...devOutbox].reverse().find((m) => m.to === to)

export default () => {
  describe('the login flow', () => {
    const stamp = Date.now()
    const anna = { email: `anna-${stamp}@example.test`, password: 'Sample-pw-123456!' }
    const bruno = { email: `bruno-${stamp}@example.test`, password: 'Sample-pw-123456!' }

    before(async () => {
      await login()
      await post('/users', anna)
      await post('/users', bruno)
      await logout()
    })
    after(async () => {
      await logout()
    })

    it('opens a session with a password when nothing else is owed', async () => {
      const { status, data } = await flow('start', { method: 'password', ...anna })
      expect(status).toBe(200)
      expect(data.token).toEqual(expect.any(String))
      expect(data.email).toBe(anna.email)
    })

    it('answers every password failure with the same refusal', async () => {
      const wrong = await flow('start', { method: 'password', email: anna.email, password: 'not-the-password' })
      const nobody = await flow('start', { method: 'password', email: `nobody-${stamp}@example.test`, password: 'whatever-1A!' })
      expect([wrong.status, wrong.data.code]).toEqual([401, 'AUTH_INVALID_CREDENTIALS'])
      expect([nobody.status, nobody.data.code]).toEqual([401, 'AUTH_INVALID_CREDENTIALS'])
    })

    it('signs in with a code sent to the address, and counts the wrong ones', async () => {
      const started = await flow('start', { method: 'email-otp', email: anna.email })
      expect(started.status).toBe(202)
      expect(started.data.flow).toEqual(expect.any(String))
      const [option] = started.data.stage.options
      expect(option).toMatchObject({ id: 'email-otp', kind: 'identifier', challenge: { channel: 'email', destination: 'a***@e***.test' } })

      await delivered()
      const sent = lastCodeFor(anna.email)
      expect(sent).toMatchObject({ channel: 'email', purpose: 'identify', plane: 'tenant' })
      expect(sent!.code).toMatch(/^\d{8}$/)

      const wrong = await flow('step', { flow: started.data.flow, method: 'email-otp', code: '00000000' })
      expect([wrong.status, wrong.data.code, wrong.data.remaining]).toEqual([401, 'FLOW_CODE_INVALID', 4])

      const done = await flow('step', { flow: started.data.flow, method: 'email-otp', code: sent!.code })
      expect(done.status).toBe(200)
      useToken(done.data)
      expect((await get('/users/me')).email).toBe(anna.email)
      await logout()

      // A flow is good for one session.
      const again = await flow('step', { flow: started.data.flow, method: 'email-otp', code: sent!.code })
      expect([again.status, again.data.code]).toEqual([401, 'FLOW_REQUIRED'])
    })

    it('answers an unknown address exactly as a known one, and sends nothing', async () => {
      const before = devOutbox.length
      const unknown = await flow('start', { method: 'email-otp', email: `ghost-${stamp}@example.test` })
      expect(unknown.status).toBe(202)
      expect(unknown.data.stage.options[0]).toMatchObject({ id: 'email-otp', challenge: { channel: 'email', destination: 'g***@e***.test' } })
      await delivered()
      expect(devOutbox.length).toBe(before)
    })

    it('does not let an administrator in with a mailbox alone', async () => {
      const started = await flow('start', { method: 'email-otp', email: process.env.ADMIN_EMAIL || 'admin@user.com' })
      expect(started.status).toBe(202)
      await delivered()
      const sent = lastCodeFor(process.env.ADMIN_EMAIL || 'admin@user.com')
      const refused = await flow('step', { flow: started.data.flow, method: 'email-otp', code: sent!.code })
      expect([refused.status, refused.data.code]).toEqual([403, 'FLOW_METHOD_NOT_ALLOWED'])
    })

    it('asks for the TOTP code of whoever enrolled one, through the injected MFA manager', async () => {
      await login(bruno.email, bruno.password)
      const setup = await post('/auth/mfa/setup', {})
      expect(setup.secret).toEqual(expect.any(String))
      // The code of the previous step: the enrolment spends it, and the login below uses a later one.
      expect(await post('/auth/mfa/enable', { secret: setup.secret, token: totp(setup.secret, -1) })).toEqual({ ok: true })
      await logout()

      const started = await flow('start', { method: 'password', ...bruno })
      expect(started.status).toBe(202)
      expect(started.data.stage.options).toEqual([{ id: 'totp', kind: 'verifier' }])

      const done = await flow('step', { flow: started.data.flow, method: 'totp', code: totp(setup.secret) })
      expect(done.status).toBe(200)
      expect(done.data.email).toBe(bruno.email)
    })
  })
}
