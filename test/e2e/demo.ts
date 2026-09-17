import { expect } from 'expect'
import { login, logout, get, get_with_headers, post, put, del } from '../common/api.js'

//
// The sample, over HTTP, the way a client uses it (T-10.25).
//
// Each case is one of the things phase 10 found broken without an error: the project's own
// tables never created (T-10.19), the admin manifest unreachable on a single-tenant deployment
// (T-10.22), and the profile service documented and never wired (T-10.23). A green run of the
// old suite said none of it, because the old suite asserted that an array literal had a length.
//
export default () => {
  describe('the sample over HTTP', () => {
    before(async () => {
      await login()
    })
    after(async () => {
      await logout()
    })

    it('reads and writes the caller profile, taking the user from the token', async () => {
      const before = await get('/profile')
      expect(before.userId).toBeDefined()

      const written = await put('/profile', { firstName: 'Ada', language: 'it', userId: 'someone-else' })
      expect(written.userId).toBe(before.userId)
      expect(written.firstName).toBe('Ada')
      expect(written.language).toBe('it')
    })

    it('creates, finds through Magic Query and deletes a partner, in a table that exists', async () => {
      const name = `e2e-${Date.now()}`
      const created = await post('/partners', { name, email: `${name}@example.test`, type: 'client' })
      expect(created.id).toBeDefined()

      const { data, headers } = await get_with_headers(`/partners?name:eq=${encodeURIComponent(name)}`)
      expect(data.map((p: { id: string }) => p.id)).toEqual([created.id])
      expect(Number(headers['v-total'])).toBe(1)

      await del(`/partners/${created.id}`)
      const after = await get(`/partners?name:eq=${encodeURIComponent(name)}`)
      expect(after).toEqual([])
    })

    it('serves the admin manifest to the founder, with the partner resource described', async () => {
      const manifest = await get('/admin/manifest')
      expect(manifest.tenancy).toEqual({ mode: 'single' })

      const partner = manifest.resources.find((r: { name: string }) => r.name === 'partner')
      expect(partner.group).toBe('crm')
      expect(partner.titleField).toBe('name')
      expect(partner.search.fields).toEqual(['name', 'email'])
    })

    it('refuses the profile once the session is gone', async () => {
      await logout()
      await expect(get('/profile')).rejects.toMatchObject({ response: { status: 401 } })
      await login()
    })
  })
}
