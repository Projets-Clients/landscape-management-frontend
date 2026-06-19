import { avatarColor, initials } from '@/lib/utils'
import { cn } from '@/lib/utils'

const SIZE = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
}

interface AvatarProps {
  id: string
  firstName: string
  lastName: string
  size?: keyof typeof SIZE
  className?: string
}

export function Avatar({ id, firstName, lastName, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZE[size],
        avatarColor(id),
        className,
      )}
      title={`${firstName} ${lastName}`}
    >
      {initials({ firstName, lastName })}
    </div>
  )
}
