import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { useAuthStore } from '@/store/auth.store'

const API_URL = import.meta.env.VITE_API_URL

export function SessionProvider() {
  const [ready, setReady] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { accessToken: string }
          const username = sessionStorage.getItem('username') ?? ''
          setAuth(data.accessToken, username)
        } else {
          clearAuth()
        }
      })
      .catch(() => clearAuth())
      .finally(() => setReady(true))
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
