import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { useAuthStore, getStoredRefreshToken } from '@/store/auth.store'

const API_URL = import.meta.env.VITE_API_URL

function buildRefreshRequest(): Request {
  const storedToken = getStoredRefreshToken()
  return new Request(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: storedToken ? { 'Content-Type': 'application/json' } : {},
    body: storedToken ? JSON.stringify({ refreshToken: storedToken }) : undefined,
  })
}

// Fired once at module load — survives React StrictMode double-invocation
const sessionRefresh: Promise<{ accessToken: string; refreshToken: string } | null> = fetch(
  buildRefreshRequest(),
)
  .then((res) => (res.ok ? (res.json() as Promise<{ accessToken: string; refreshToken: string }>) : null))
  .catch(() => null)

export function SessionProvider() {
  const [ready, setReady] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    void sessionRefresh.then((data) => {
      if (data) {
        setAuth(data.accessToken, sessionStorage.getItem('username') ?? '', data.refreshToken)
      } else {
        clearAuth()
      }
      setReady(true)
    })
  }, [setAuth, clearAuth])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  return <RouterProvider router={router} />
}
