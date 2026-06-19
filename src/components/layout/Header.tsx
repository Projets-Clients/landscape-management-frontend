import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const username = useAuthStore((s) => s.username)

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b bg-card px-4',
        className,
      )}
    >
      <span className="font-semibold text-primary">Landscape</span>
      <span className="text-sm text-muted-foreground">{username}</span>
    </header>
  )
}
