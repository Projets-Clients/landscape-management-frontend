import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types/api'

interface RoleRouteProps {
  allowed: UserRole[]
}

export function RoleRoute({ allowed }: RoleRouteProps) {
  const role = useAuthStore((s) => s.role)
  if (!role || !allowed.includes(role)) return <Navigate to="/" replace />
  return <Outlet />
}
