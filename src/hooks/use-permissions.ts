import { useAuthStore } from '@/store/auth.store'
import { FULL_PERMISSIONS, EMPTY_PERMISSIONS, can as canFn } from '@/lib/permissions'
import type { PermModule, PermAction, Permissions } from '@/types/api'

export function usePermissions() {
  const { role, permissions } = useAuthStore()
  const isAdmin = role === 'ADMIN'

  const effective: Permissions = isAdmin ? FULL_PERMISSIONS : (permissions ?? EMPTY_PERMISSIONS)

  return {
    can: (module: PermModule, action: PermAction): boolean =>
      isAdmin || canFn(effective, module, action),
    isAdmin,
    permissions: effective,
  }
}
