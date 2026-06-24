import { NavLink } from 'react-router-dom'
import { LayoutDashboard, HardHat, Users, UserCog, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types/api'

interface NavItem {
  to: string
  icon: React.ElementType
  label: string
  end?: boolean
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { to: '/', icon: LayoutDashboard, label: 'Accueil', end: true },
    { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/utilisateurs', icon: UserCog, label: 'Équipe' },
    { to: '/parametres', icon: Settings, label: 'Paramètres' },
  ],
  FOREMAN: [
    { to: '/', icon: LayoutDashboard, label: 'Accueil', end: true },
    { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
    { to: '/parametres', icon: Settings, label: 'Paramètres' },
  ],
  EMPLOYEE: [
    { to: '/', icon: LayoutDashboard, label: 'Accueil', end: true },
    { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
    { to: '/parametres', icon: Settings, label: 'Paramètres' },
  ],
}

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const role = useAuthStore((s) => s.role)
  const items = role ? NAV_BY_ROLE[role] : []

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 flex border-t bg-card safe-area-bottom',
        className,
      )}
    >
      {items.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors min-h-[56px] justify-center',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span className="leading-none">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
