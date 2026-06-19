import { useAuthStore } from '@/store/auth.store'

const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { accessToken: string }
    return data.accessToken
  } catch {
    return null
  }
}

function waitForRefresh(): Promise<string | null> {
  return new Promise((resolve) => refreshQueue.push(resolve))
}

async function doRefresh(): Promise<string | null> {
  isRefreshing = true
  const token = await refreshAccessToken()
  isRefreshing = false

  const { setAuth, clearAuth } = useAuthStore.getState()
  if (token) {
    const username = sessionStorage.getItem('username') ?? ''
    setAuth(token, username)
  } else {
    clearAuth()
  }

  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
  return token
}

async function fetchWithAuth(
  path: string,
  options: RequestInit,
  token: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {}

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  })
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().accessToken
  let res = await fetchWithAuth(path, options, token)

  if (res.status === 401) {
    let newToken: string | null

    if (isRefreshing) {
      newToken = await waitForRefresh()
    } else {
      newToken = await doRefresh()
    }

    if (!newToken) throw new ApiError(401, 'Session expirée')
    res = await fetchWithAuth(path, options, newToken)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiError(res.status, body.message ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
