import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, Monitor, Moon, Sun, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth.store'
import { useTheme, COLORS } from '@/providers/ThemeProvider'
import type { ColorKey } from '@/providers/ThemeProvider'
import { apiRequest } from '@/lib/api-client'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  FOREMAN: 'Chef d\'équipe',
  EMPLOYEE: 'Employé',
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { username, role, userId, clearAuth } = useAuthStore()
  const { theme, setTheme, color, setColor } = useTheme()

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

      <div className="space-y-2">
        <p className="text-sm font-semibold">Couleur</p>
        <Card className="p-3">
          <div className="grid grid-cols-4 gap-3">
            {(Object.entries(COLORS) as [ColorKey, typeof COLORS[ColorKey]][]).map(([key, { label, hex }]) => (
              <button
                key={key}
                title={label}
                onClick={() => setColor(key)}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full ring-offset-background transition-all"
                  style={{
                    backgroundColor: hex,
                    boxShadow: color === key ? `0 0 0 2px white, 0 0 0 4px ${hex}` : undefined,
                  }}
                >
                  {color === key && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white">
                      <path d="M1.5 6.5l3 3 6-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">Apparence</p>
        <Card className="p-1">
          <div className="grid grid-cols-3 gap-1">
            {([
              { value: 'system', label: 'Système', icon: Monitor },
              { value: 'light', label: 'Clair', icon: Sun },
              { value: 'dark', label: 'Sombre', icon: Moon },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={[
                  'flex flex-col items-center gap-1.5 rounded-md px-2 py-3 text-xs font-medium transition-colors',
                  theme === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </Card>
      </div>

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
