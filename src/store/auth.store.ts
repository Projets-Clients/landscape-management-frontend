import { create } from 'zustand'
import type { UserRole } from '@/types/api'

const REFRESH_TOKEN_KEY = 'landscape-rt'

interface AuthState {
  accessToken: string | null
  username: string
  role: UserRole | null
  userId: string | null
  organizationId: string | null
  setAuth: (accessToken: string, username: string, refreshToken?: string) => void
  clearAuth: () => void
}

function decodeJwtPayload(
  token: string,
): { sub: string; role: UserRole; orgId: string } | null {
  try {
    const base64url = token.split('.')[1]
    if (!base64url) return null
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    return JSON.parse(atob(padded)) as { sub: string; role: UserRole; orgId: string }
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  username: sessionStorage.getItem('username') ?? '',
  role: null,
  userId: null,
  organizationId: null,

  setAuth: (accessToken, username, refreshToken) => {
    const decoded = decodeJwtPayload(accessToken)
    sessionStorage.setItem('username', username)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    set({
      accessToken,
      username,
      role: decoded?.role ?? null,
      userId: decoded?.sub ?? null,
      organizationId: decoded?.orgId ?? null,
    })
  },

  clearAuth: () => {
    sessionStorage.removeItem('username')
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    set({ accessToken: null, username: '', role: null, userId: null, organizationId: null })
  },
}))

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}
