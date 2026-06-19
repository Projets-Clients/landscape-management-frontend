import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth.store'
import { apiRequest } from '@/lib/api-client'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  FOREMAN: 'Chef d\'équipe',
  EMPLOYEE: 'Employé',
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { username, role, userId, clearAuth } = useAuthStore()

  async function handleLogout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch {
      // ignore — clear locally regardless
    }
    clearAuth()
    void navigate('/login', { replace: true })
    toast.success('Déconnecté')
  }

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-xl font-bold">Profil</h1>

      <div className="flex flex-col items-center gap-3 py-4">
        <div className={[
          'flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold',
          userId ? 'bg-primary/10 text-primary' : 'bg-muted',
        ].join(' ')}>
          {userId ? username.charAt(0).toUpperCase() : <User className="h-7 w-7 text-muted-foreground" />}
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">{username}</p>
          {role && (
            <p className="text-sm text-muted-foreground">{ROLE_LABELS[role] ?? role}</p>
          )}
        </div>
      </div>

      <Card className="divide-y">
        <div className="flex items-center justify-between p-4 min-h-[56px]">
          <p className="text-sm text-muted-foreground">Identifiant</p>
          <p className="text-sm font-medium">@{username}</p>
        </div>
        <div className="flex items-center justify-between p-4 min-h-[56px]">
          <p className="text-sm text-muted-foreground">Rôle</p>
          <p className="text-sm font-medium">{role ? (ROLE_LABELS[role] ?? role) : '—'}</p>
        </div>
      </Card>

      <Separator />

      <Button
        variant="destructive"
        className="w-full min-h-[48px] gap-2"
        onClick={() => void handleLogout()}
      >
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </Button>
    </div>
  )
}
