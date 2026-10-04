import { expect } from 'expect'
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { baseURL, flow, login, logout, post, put, useToken } from '../common/api.js'

//
// The MCP server (T-14.7 of the framework), over HTTP, with the SDK's own client: an assistant acts
// as the person whose credential it presents, and every rule of the API holds for it.
//

const endpoint = new URL('mcp', baseURL)

async function assistant(token: string): Promise<Client> {
  const client = new Client({ name: 'sample-e2e', version: '0.0.0' })
  await client.connect(
    new StreamableHTTPClientTransport(endpoint, { requestInit: { headers: { Authorization: `Bearer ${token}` } } })
  )
  return client
}

type ToolResult = Awaited<ReturnType<Client['callTool']>>
const text = (result: ToolResult) => (result.content as { type: string; text: string }[])[0].text
const json = (result: ToolResult) => JSON.parse(text(result))

export default () => {
  describe('the MCP server', () => {
    const stamp = Date.now()
    const alice = { email: `alice-${stamp}@example.test`, password: 'Sample-pw-123456!' }
    const bob = { email: `bob-${stamp}@example.test`, password: 'Sample-pw-123456!' }
    const partnerName = `mcp-${stamp}`
    let aliceToken: string
    let bobToken: string
    let adminToken: string
    let integrationToken: string
    let partnerId: string

    const sessionOf = async (who: typeof alice) => {
      const { status, data } = await flow('start', { method: 'password', ...who })
      expect(status).toBe(200)
      return data as { token: string }
    }

    before(async () => {
      adminToken = (await login()).token
      await post('/users', alice)
      await post('/users', bob)
      partnerId = (await post('/partners', { name: partnerName, email: `${partnerName}@example.test`, type: 'client' })).id
      // Issued as an operator issues one; the bearer is in this answer and nowhere else.
      const expiresAt = new Date(Date.now() + 3600_000).toISOString()
      integrationToken = (await post('/token', { name: `mcp-${stamp}`, requiredRoles: ['custom'], expiresAt })).token

      const aliceSession = await sessionOf(alice)
      aliceToken = aliceSession.token
      useToken(aliceSession)
      await put('/profile', { firstName: 'Alice' })

      const bobSession = await sessionOf(bob)
      bobToken = bobSession.token
      useToken(bobSession)
      await put('/profile', { firstName: 'Bob' })
      await logout()
    })
    after(async () => {
      await logout()
    })

    it('lists its tools', async () => {
      const client = await assistant(aliceToken)
      const { tools } = await client.listTools()
      await client.close()
      expect(tools.map((t) => t.name)).toEqual(['my_profile', 'find_partners', 'delete_partner'])
    })

    it('shows each person their own data, also when two assistants call at once', async () => {
      const [a, b] = await Promise.all([assistant(aliceToken), assistant(bobToken)])
      const [ra, rb] = await Promise.all([
        a.callTool({ name: 'my_profile', arguments: {} }),
        b.callTool({ name: 'my_profile', arguments: {} })
      ])
      await Promise.all([a.close(), b.close()])

      // The SDK leaves `isError` out of a result that is not one.
      expect([ra.isError, rb.isError]).toEqual([undefined, undefined])
      const [pa, pb] = [json(ra), json(rb)]
      expect([pa.firstName, pb.firstName]).toEqual(['Alice', 'Bob'])
      expect(pa.userId).not.toBe(pb.userId)
    })

    it('works with an integration token, within the roles of the token', async () => {
      const client = await assistant(integrationToken)
      const found = await client.callTool({ name: 'find_partners', arguments: { name: partnerName.toUpperCase() } })
      await client.close()
      expect(found.isError).toBeUndefined()
      expect(json(found).map((p: { id: string }) => p.id)).toEqual([partnerId])
    })

    it('passes the API refusal of a route the person may not use as the tool error', async () => {
      // alice has no `custom` role: the partner routes refuse her, and so does her assistant.
      const client = await assistant(aliceToken)
      const found = await client.callTool({ name: 'find_partners', arguments: {} })
      await client.close()
      expect(found.isError).toBe(true)
      expect(text(found)).toMatch(/^[A-Z_]+: /)
    })

    it('answers the step-up of a freshAuth route as the tool error, and deletes nothing', async () => {
      const token = await assistant(integrationToken)
      const refused = await token.callTool({ name: 'delete_partner', arguments: { id: partnerId } })
      await token.close()
      expect(refused.isError).toBe(true)
      expect(text(refused)).toBe('STEP_UP_NOT_AVAILABLE: This credential cannot confirm its holder: log in again')
    })

    it('deletes through a freshAuth route for a session opened a moment ago', async () => {
      const admin = await assistant(adminToken)
      const deleted = await admin.callTool({ name: 'delete_partner', arguments: { id: partnerId } })
      const after = await admin.callTool({ name: 'find_partners', arguments: { name: partnerName } })
      await admin.close()
      expect(deleted.isError).toBeUndefined()
      expect(json(after)).toEqual([])
    })

    it('refuses a browser origin it does not trust, and a request without a credential', async () => {
      const initialize = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'probe', version: '0.0.0' } }
      })
      const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }

      const foreign = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, authorization: `Bearer ${aliceToken}`, origin: 'https://evil.test' },
        body: initialize
      })
      expect(foreign.status).toBe(403)
      expect(await foreign.json()).toEqual({ jsonrpc: '2.0', error: { code: -32000, message: 'Origin not allowed' } })

      const anonymous = await fetch(endpoint, { method: 'POST', headers, body: initialize })
      expect(anonymous.status).toBe(401)
    })
  })
}
