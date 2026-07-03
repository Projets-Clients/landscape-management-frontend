import type { PermModule, PermAction, Permissions } from '@/types/api'

export const MODULES = ['chantiers', 'clients', 'equipe', 'prestations'] as const
export const ACTIONS = ['read', 'create', 'update', 'delete'] as const

export const EMPTY_PERMISSIONS: Permissions = {
  chantiers: [],
  clients: [],
  equipe: [],
  prestations: [],
}

export const FULL_PERMISSIONS: Permissions = {
  chantiers: ['read', 'create', 'update', 'delete'],
  clients: ['read', 'create', 'update', 'delete'],
  equipe: ['read', 'create', 'update', 'delete'],
  prestations: ['read', 'create', 'update', 'delete'],
}

export function can(
  permissions: Permissions | null | undefined,
  module: PermModule,
  action: PermAction,
): boolean {
  if (!permissions) return false
  return (permissions[module] ?? []).includes(action)
}

export function makePermissions(partial: Partial<Permissions>): Permissions {
  return { ...EMPTY_PERMISSIONS, ...partial }
}
