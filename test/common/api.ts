import axios from 'axios'
const baseURL = `http://0.0.0.0:${process.env.PORT?.replace(/\\n/gm, '\n') || 2231}/`
const http = axios.create({ baseURL })
// The login routes as a client that holds nothing yet calls them: no token, and a 4xx is an answer.
const anonymous = axios.create({ baseURL, validateStatus: () => true })

import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../common/bootstrap.js'

/**
 * A login with a password (docs/AUTH_FLOW_V5.md of the framework). The tests run in bearer mode,
 * so a completed login answers 200 with the token; a 202 means a further stage is owed, and this
 * helper, which is for subjects that owe none, says so instead of guessing.
 */
export async function login(email = DEFAULT_ADMIN_EMAIL, password = DEFAULT_ADMIN_PASSWORD) {
  delete http.defaults.headers.common.Authorization
  const { status, data } = await http.post('/auth/flow/start', { method: 'password', email, password })
  if (status === 202) throw new Error(`login(${email}) owes a further stage: ${JSON.stringify(data.stage)}`)
  return useToken(data)
}

/** Keeps the token of a completed login for the next requests. */
export function useToken(data: { token: string }) {
  http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
  return data
}

/** A flow request as it is, status and body, without a token and without throwing on 4xx. */
export async function flow(path: 'start' | 'step' | 'challenge' | 'cancel', body: Record<string, unknown>) {
  const { status, data } = await anonymous.post(`/auth/flow/${path}`, body)
  return { status, data }
}

export async function logout() {
  delete http.defaults.headers.common.Authorization
}

export async function get(...args: Parameters<typeof http.get>) {
  const { data } = await http.get(...args)
  return data
}

export async function get_with_headers(...args: Parameters<typeof http.get>) {
  const { data, headers } = await http.get(...args)
  return { data, headers }
}

export async function post(...args: Parameters<typeof http.post>) {
  const { data } = await http.post(...args)
  return data
}

export async function put(...args: Parameters<typeof http.put>) {
  const { data } = await http.put(...args)
  return data
}

export async function del(...args: Parameters<typeof http.delete>) {
  const { data } = await http.delete(...args)
  return data
}
