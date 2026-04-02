import axios from 'axios'
const http = axios.create({ baseURL: `http://0.0.0.0:${process.env.PORT?.replace(/\\n/gm, '\n') || 2231}/` })

import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../common/bootstrap.js'

export async function login(email = DEFAULT_ADMIN_EMAIL, password = DEFAULT_ADMIN_PASSWORD) {
  try {
    delete http.defaults.headers.common.Authorization
    const { data } = await http.post('/auth/login', {
      email,
      password
    })
    http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  } catch (err) {
    console.log(err)
    throw err
  }
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

export function toQueryString(data: Record<string, string>) {
  let qs = ''
  Object.keys(data).map((k) => {
    qs += `&${k}=${data[k]}`
  })
  return qs.slice(1).replace(' ', '%20')
}
