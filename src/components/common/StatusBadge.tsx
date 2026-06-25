import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types/api'

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Brouillon',
    className: 'bg-gray-100 text-gray-700 border border-gray-200',
  },
  PLANNED: {
    label: 'Planifié',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  IN_PROGRESS: {
    label: 'En cours',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  AWAITING_SIGNATURE: {
    label: 'Signature',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
  },
  COMPLETED: {
    label: 'Terminé',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  DISPUTED: {
    label: 'Litige',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
}

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
