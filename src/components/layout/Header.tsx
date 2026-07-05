import { Leaf, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/hooks/use-organization'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { data: org } = useOrganization()

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b bg-card px-4',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Leaf className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-primary">{org?.name ?? 'Landscape'}</span>
      </div>
      <NavLink
        to="/parametres"
        className={({ isActive }) =>
          cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )
        }
      >
        <Settings className="h-5 w-5" />
      </NavLink>
    </header>
  )
}
