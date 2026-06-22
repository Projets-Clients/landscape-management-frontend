import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HardHat, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { useProjects } from '@/hooks/use-projects'
import { useAuthStore } from '@/store/auth.store'
import { formatDate } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/api'

const STATUS_FILTERS: { label: string; value: ProjectStatus | undefined }[] = [
  { label: 'Tous', value: undefined },
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Planifié', value: 'PLANNED' },
  { label: 'En cours', value: 'IN_PROGRESS' },
  { label: 'Signature', value: 'AWAITING_SIGNATURE' },
  { label: 'Terminé', value: 'COMPLETED' },
  { label: 'Litige', value: 'DISPUTED' },
]

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-colors active:bg-muted min-h-[88px]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{project.title}</p>
          <p className="text-xs text-muted-foreground">{project.reference}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {project.client && (
          <span className="truncate">
            {project.client.firstName} {project.client.lastName}
          </span>
        )}
        {project.expectedEndDate && (
          <span className="shrink-0">→ {formatDate(project.expectedEndDate)}</span>
        )}
      </div>
      <p className="truncate text-xs text-muted-foreground">{project.address}</p>
    </button>
  )
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const role = useAuthStore((s) => s.role)

  const statusParam = searchParams.get('status') as ProjectStatus | null
  const statusFilter = statusParam ?? undefined

  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useProjects({ status: statusFilter })

  const query = searchQuery.trim().toLowerCase()
  const projects = data?.data ?? []
  const visible = query
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.reference.toLowerCase().includes(query),
      )
    : projects

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Chantiers</h1>
        {role === 'ADMIN' && (
          <Button
            size="sm"
            className="min-h-[44px]"
            onClick={() => void navigate('/chantiers/nouveau')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nouveau
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher par titre ou référence…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-xl border bg-card pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Effacer la recherche"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => {
              if (f.value) {
                setSearchParams({ status: f.value })
              } else {
                setSearchParams({})
              }
            }}
            className={[
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px]',
              statusFilter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <EmptyState
          icon={HardHat}
          title={query ? 'Aucun résultat' : 'Aucun chantier'}
          description={
            query
              ? `Aucun chantier ne correspond à "${searchQuery.trim()}"`
              : statusFilter
                ? 'Aucun chantier avec ce statut'
                : 'Aucun chantier pour le moment'
          }
          action={
            !query && role === 'ADMIN'
              ? { label: 'Créer un chantier', onClick: () => void navigate('/chantiers/nouveau') }
              : undefined
          }
        />
      )}

      <div className="space-y-3">
        {visible.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => void navigate(`/chantiers/${project.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
