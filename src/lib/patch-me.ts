import { useAuthStore } from '@/store/auth.store'

const API_URL = import.meta.env.VITE_API_URL

export function patchMe(body: object) {
  const token = useAuthStore.getState().accessToken
  if (!token) return
  void fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).catch(() => {})
}
