import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'

interface AvatarStackProps {
  users: { id: string; firstName: string; lastName: string }[]
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function AvatarStack({ users, max = 4, size = 'sm', className }: AvatarStackProps) {
  const visible = users.slice(0, max)
  const overflow = users.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((u) => (
        <Avatar
          key={u.id}
          id={u.id}
          firstName={u.firstName}
          lastName={u.lastName}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full ring-2 ring-background text-xs font-medium',
            size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
            'bg-muted text-muted-foreground',
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
