import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/lib/api-client'
import { Trash2, ChevronDown, ChevronUp, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/use-roles'
import { MODULES, ACTIONS, EMPTY_PERMISSIONS } from '@/lib/permissions'
import type { Role, Permissions, PermModule, PermAction } from '@/types/api'

function PermissionMatrix({
  permissions,
  onChange,
  disabled,
}: {
  permissions: Permissions
  onChange: (p: Permissions) => void
  disabled?: boolean
}) {
  const { t } = useTranslation()

  function toggle(module: PermModule, action: PermAction) {
    const current = permissions[module] ?? []
    const next = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action]
    onChange({ ...permissions, [module]: next })
  }

  function toggleRow(module: PermModule, allChecked: boolean) {
    onChange({ ...permissions, [module]: allChecked ? [] : [...ACTIONS] })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="py-1.5 pr-3 text-left font-medium text-muted-foreground w-[35%]" />
            {ACTIONS.map((a) => (
              <th key={a} className="py-1.5 px-1 text-center font-medium text-muted-foreground capitalize">
                {t(`users.action_${a}`)}
              </th>
            ))}
            <th className="py-1.5 px-1 text-center font-medium text-muted-foreground w-8" />
          </tr>
        </thead>
        <tbody>
          {MODULES.map((module) => {
            const allowed = permissions[module] ?? []
            const allChecked = ACTIONS.every((a) => allowed.includes(a))
            return (
              <tr key={module} className="border-t border-border/50">
                <td className="py-2 pr-3 font-medium">{t(`users.module_${module}`)}</td>
                {ACTIONS.map((action) => (
                  <td key={action} className="py-2 px-1 text-center">
                    <input
                      type="checkbox"
                      checked={allowed.includes(action)}
                      onChange={() => toggle(module, action)}
                      disabled={disabled}
                      className="h-4 w-4 accent-primary cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>
                ))}
                <td className="py-2 px-1 text-center">
                  <button
                    type="button"
                    onClick={() => toggleRow(module, allChecked)}
                    disabled={disabled}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none"
                    title={allChecked ? t('users.uncheck_all') : t('users.check_all')}
                  >
                    {allChecked ? '✗' : '✓'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function RoleRow({ role, isAdmin }: { role: Role; isAdmin: boolean }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState(role.name)
  const [permissions, setPermissions] = useState<Permissions>(role.permissions)
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const hasChanges =
    name.trim() !== role.name ||
    JSON.stringify(permissions) !== JSON.stringify(role.permissions)

  async function handleSave() {
    try {
      await updateRole.mutateAsync({ id: role.id, name: name.trim(), permissions })
      toast.success(t('users.role_updated'))
    } catch {
      toast.error(t('users.role_update_error'))
    }
  }

  async function handleDelete() {
    if (!confirm(t('users.role_delete_confirm'))) return
    try {
      await deleteRole.mutateAsync(role.id)
      toast.success(t('users.role_deleted'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      toast.error(msg.includes('encore assigné') ? t('users.role_in_use') : t('users.role_delete_error'))
    }
  }

  return (
    <div>
      <button
        onClick={() => isAdmin && setExpanded((v) => !v)}
        className={['flex min-h-[56px] w-full items-center gap-3 p-4 text-left transition-colors', isAdmin ? 'active:bg-muted' : 'cursor-default'].join(' ')}
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{role.name}</p>
          <p className="text-xs text-muted-foreground">
            {t('users.role_users_count', { count: role._count?.users ?? 0 })}
          </p>
        </div>
        {isAdmin && (expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ))}
      </button>

      {expanded && (
        <div className="space-y-3 border-t bg-muted/30 p-4">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('users.role_name')}</Label>
            <Input
              className="min-h-[44px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={30}
              disabled={updateRole.isPending}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium">{t('users.role_permissions')}</p>
            <PermissionMatrix
              permissions={permissions}
              onChange={setPermissions}
              disabled={updateRole.isPending}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="destructive"
              size="sm"
              className="min-h-[44px] gap-1.5"
              onClick={() => void handleDelete()}
              disabled={deleteRole.isPending || (role._count?.users ?? 0) > 0}
            >
              {deleteRole.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              className="min-h-[44px] flex-1"
              onClick={() => void handleSave()}
              disabled={updateRole.isPending || !hasChanges || !name.trim()}
            >
              {updateRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateRoleForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const createRole = useCreateRole()
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState<Permissions>(EMPTY_PERMISSIONS)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createRole.mutateAsync({ name: name.trim(), permissions })
      toast.success(t('users.role_created'))
      onClose()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t('users.role_create_error')
      toast.error(msg)
    }
  }

  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold">{t('users.new_role')}</h2>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t('users.role_name')}</Label>
          <Input
            className="min-h-[44px]"
            placeholder={t('users.role_name_placeholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={30}
            required
            disabled={createRole.isPending}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">{t('users.role_permissions')}</p>
          <PermissionMatrix
            permissions={permissions}
            onChange={setPermissions}
            disabled={createRole.isPending}
          />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="min-h-[44px] flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="min-h-[44px] flex-1" disabled={createRole.isPending || !name.trim()}>
            {createRole.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.save')}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function RolesTab({ showCreate, onCloseCreate, isAdmin }: { showCreate: boolean; onCloseCreate: () => void; isAdmin: boolean }) {
  const { t } = useTranslation()
  const { data: roles, isLoading } = useRoles()

  return (
    <div className="space-y-4">
      {showCreate && isAdmin && <CreateRoleForm onClose={onCloseCreate} />}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-[56px] rounded-xl" />)}
        </div>
      )}

      {!isLoading && roles?.length === 0 && !showCreate && (
        <EmptyState icon={ShieldCheck} title={t('users.roles_empty')} />
      )}

      {roles && roles.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card divide-y">
          {roles.map((role) => <RoleRow key={role.id} role={role} isAdmin={isAdmin} />)}
        </div>
      )}
    </div>
  )
}
