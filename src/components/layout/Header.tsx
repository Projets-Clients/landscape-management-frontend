import { useState } from 'react'
import { Leaf, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/hooks/use-organization'
import { AppDrawer } from './AppDrawer'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { data: org } = useOrganization()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header
        className={cn(
          'app-header flex h-14 items-center justify-between border-b bg-card px-4',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-primary">{org?.name ?? 'Landscape'}</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
