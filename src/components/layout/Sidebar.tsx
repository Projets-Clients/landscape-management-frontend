import { NavLink } from 'react-router-dom'
import { LayoutDashboard, HardHat, Users, UserCog, User, Leaf } from 'lucide-react'
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
    { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
    { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/utilisateurs', icon: UserCog, label: 'Utilisateurs' },
    { to: '/profil', icon: User, label: 'Profil' },
  ],
  FOREMAN: [
    { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
    { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
    { to: '/profil', icon: User, label: 'Profil' },
  ],
  EMPLOYEE: [
    { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', end: true },
    { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
    { to: '/profil', icon: User, label: 'Profil' },
  ],
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const role = useAuthStore((s) => s.role)
  const items = role ? NAV_BY_ROLE[role] : []

  return (
    <aside className={cn('w-60 flex-col border-r bg-card', className)}>
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Leaf className="h-5 w-5 text-primary" />
        <span className="font-bold tracking-tight text-foreground">Landscape</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
