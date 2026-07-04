import { useAuthStore } from '@/store/auth.store'
import { FULL_PERMISSIONS, EMPTY_PERMISSIONS, makePermissions, can as canFn } from '@/lib/permissions'
import type { PermModule, PermAction, Permissions } from '@/types/api'

// FOREMAN et EMPLOYEE bypassent le PermissionsGuard backend — côté front, on leur donne chantiers complet
const FOREMAN_PERMISSIONS: Permissions = makePermissions({
  chantiers: ['read', 'create', 'update', 'delete'],
})

export function usePermissions() {
  const { role, permissions } = useAuthStore()
  const isAdmin = role === 'ADMIN'

  let effective: Permissions
  if (isAdmin) {
    effective = FULL_PERMISSIONS
  } else if (role === 'FOREMAN' || role === 'EMPLOYEE') {
    effective = FOREMAN_PERMISSIONS
  } else {
    effective = permissions ?? EMPTY_PERMISSIONS
  }

  return {
    can: (module: PermModule, action: PermAction): boolean =>
      isAdmin || canFn(effective, module, action),
    isAdmin,
    permissions: effective,
  }
}
