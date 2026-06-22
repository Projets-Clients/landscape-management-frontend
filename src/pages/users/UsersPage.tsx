import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, ChevronDown, ChevronUp, Loader2, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Avatar } from '@/components/common/Avatar'
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/use-users'
import { fullName } from '@/lib/utils'
import type { User, UserRole } from '@/types/api'

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  FOREMAN: "Chef d'équipe",
  EMPLOYEE: 'Employé',
}

function UserRow({ user }: { user: User }) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email ?? '',
    role: user.role,
    password: '',
  })
  const update = useUpdateUser(user.id)

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (form.password && form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    try {
      await update.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
      })
      setForm((f) => ({ ...f, password: '' }))
      toast.success('Utilisateur mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  async function handleToggleActive() {
    try {
      await update.mutateAsync({ active: !user.active })
      toast.success(user.active ? 'Compte désactivé' : 'Compte réactivé')
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="divide-y last:divide-y-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex min-h-[64px] w-full items-center gap-3 p-4 text-left transition-colors active:bg-muted"
      >
        <Avatar id={user.id} firstName={user.firstName} lastName={user.lastName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{fullName(user)}</p>
            {!user.active && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                Inactif
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {ROLE_LABELS[user.role]} · @{user.username}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Prénom</Label>
              <Input
                className="min-h-[44px]"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                disabled={update.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nom</Label>
              <Input
                className="min-h-[44px]"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                disabled={update.isPending}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              className="min-h-[44px]"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              disabled={update.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Rôle</Label>
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              disabled={update.isPending}
              className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="EMPLOYEE">Employé</option>
              <option value="FOREMAN">Chef d'équipe</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nouveau mot de passe</Label>
            <Input
              type="password"
              autoComplete="new-password"
              className="min-h-[44px]"
              placeholder="Laisser vide pour ne pas changer"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              disabled={update.isPending}
            />
          </div>
          <Button
            className="w-full min-h-[44px]"
            onClick={() => void handleSave()}
            disabled={update.isPending}
          >
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
          </Button>
          <Button
            variant={user.active ? 'destructive' : 'outline'}
            size="sm"
            className="w-full min-h-[44px]"
            onClick={() => void handleToggleActive()}
            disabled={update.isPending}
          >
            {user.active ? 'Désactiver le compte' : 'Réactiver le compte'}
          </Button>
        </div>
      )}
    </div>
  )
}

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const createUser = useCreateUser()
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'EMPLOYEE' as UserRole,
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    try {
      await createUser.mutateAsync({
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
        role: form.role,
        email: form.email.trim() || undefined,
      })
      toast.success('Utilisateur créé')
      onClose()
    } catch {
      toast.error('Erreur lors de la création')
    }
  }

  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold">Nouvel utilisateur</h2>
      <form
        onSubmit={(e) => {
          void handleSubmit(e)
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cu-fn">Prénom</Label>
            <Input
              id="cu-fn"
              className="min-h-[44px]"
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cu-ln">Nom</Label>
            <Input
              id="cu-ln"
              className="min-h-[44px]"
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cu-uname">Identifiant</Label>
          <Input
            id="cu-uname"
            autoCapitalize="none"
            autoComplete="off"
            className="min-h-[44px]"
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cu-email">Email</Label>
          <Input
            id="cu-email"
            type="email"
            className="min-h-[44px]"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cu-pw">Mot de passe</Label>
          <Input
            id="cu-pw"
            type="password"
            autoComplete="new-password"
            className="min-h-[44px]"
            minLength={8}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cu-role">Rôle</Label>
          <select
            id="cu-role"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="EMPLOYEE">Employé</option>
            <option value="FOREMAN">Chef d'équipe</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] flex-1"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="min-h-[44px] flex-1"
            disabled={createUser.isPending}
          >
            {createUser.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Créer'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const [showCreate, setShowCreate] = useState(false)

  const active = users?.filter((u) => u.active) ?? []
  const inactive = users?.filter((u) => !u.active) ?? []

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Utilisateurs</h1>
        <Button
          size="sm"
          className="min-h-[44px]"
          onClick={() => setShowCreate((v) => !v)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Nouveau
        </Button>
      </div>

      {showCreate && <CreateUserForm onClose={() => setShowCreate(false)} />}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[64px] rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && users?.length === 0 && (
        <EmptyState icon={UserCog} title="Aucun utilisateur" />
      )}

      {active.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          {active.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>
      )}

      {inactive.length > 0 && (
        <div className="space-y-1">
          <p className="px-1 text-xs font-medium text-muted-foreground">
            Comptes inactifs
          </p>
          <div className="overflow-hidden rounded-xl border bg-card opacity-60">
            {inactive.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
