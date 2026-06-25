import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  total: number
  limit: number
  onChange: (page: number) => void
}

export function Pagination({ page, total, limit, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card transition-colors disabled:opacity-40 active:bg-muted"
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="min-w-[80px] text-center text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{page}</span>
        {' / '}
        {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card transition-colors disabled:opacity-40 active:bg-muted"
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
