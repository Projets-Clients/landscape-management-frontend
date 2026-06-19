import { create } from 'zustand'
import type { UserRole } from '@/types/api'

interface AuthState {
  accessToken: string | null
  username: string
  role: UserRole | null
  userId: string | null
  setAuth: (accessToken: string, username: string) => void
  clearAuth: () => void
}

function decodeJwtPayload(
  token: string,
): { sub: string; role: UserRole } | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload)) as { sub: string; role: UserRole }
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  username: sessionStorage.getItem('username') ?? '',
  role: null,
  userId: null,

  setAuth: (accessToken, username) => {
    const decoded = decodeJwtPayload(accessToken)
    sessionStorage.setItem('username', username)
    set({
      accessToken,
      username,
      role: decoded?.role ?? null,
      userId: decoded?.sub ?? null,
    })
  },

  clearAuth: () => {
    sessionStorage.removeItem('username')
    set({ accessToken: null, username: '', role: null, userId: null })
  },
}))
