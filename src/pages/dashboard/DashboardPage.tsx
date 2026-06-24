import { useNavigate } from 'react-router-dom'
import { HardHat, FileSignature, CheckCircle, AlertTriangle, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useProjects } from '@/hooks/use-projects'
import { useAuthStore } from '@/store/auth.store'
import { formatDate } from '@/lib/utils'
import type { Project } from '@/types/api'

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  color,
  onClick,
}: {
  icon: React.ElementType
  label: string
  value: number | undefined
  loading: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col items-center gap-1 rounded-xl border bg-card p-2.5 text-left transition-colors active:bg-muted sm:flex-row sm:gap-3 sm:p-4"
    >
      <div className={`rounded-xl p-1.5 sm:p-2.5 ${color}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="text-center sm:text-left">
        {loading ? (
          <Skeleton className="mb-1 h-5 w-6 sm:h-6 sm:w-8" />
        ) : (
          <p className="text-lg font-bold leading-none sm:text-2xl">{value ?? 0}</p>
        )}
        <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{label}</p>
      </div>
    </button>
  )
}

function ProjectRow({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[72px] w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors active:bg-muted"
    >
      <HardHat className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{project.title}</p>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {project.reference}
          {project.client &&
            ` · ${project.client.firstName} ${project.client.lastName}`}
        </p>
        {project.expectedEndDate && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Fin prévue : {formatDate(project.expectedEndDate)}
          </p>
        )}
      </div>
    </button>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const username = useAuthStore((s) => s.username)

  const inProgress = useProjects({ status: 'IN_PROGRESS', limit: 1 })
  const awaitingSig = useProjects({ status: 'AWAITING_SIGNATURE', limit: 1 })
  const completed = useProjects({ status: 'COMPLETED', limit: 1 })
  const disputed = useProjects({ status: 'DISPUTED', limit: 1 })
  const recent = useProjects({ limit: 20 })

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Bonjour, {username}</h1>
          <p className="hidden text-sm text-muted-foreground sm:block">Aperçu de l'activité</p>
        </div>
        {role === 'ADMIN' && (
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="min-h-[44px] min-w-[44px] gap-0.5 sm:gap-1"
              onClick={() => void navigate('/clients/nouveau')}
              title="Nouveau client"
            >
              <Plus className="h-3.5 w-3.5" />
              <User className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Nouveau client</span>
            </Button>
            <Button
              size="sm"
              className="min-h-[44px] min-w-[44px] gap-0.5 sm:gap-1"
              onClick={() => void navigate('/chantiers/nouveau')}
              title="Nouveau chantier"
            >
              <Plus className="h-3.5 w-3.5" />
              <HardHat className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Nouveau chantier</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          icon={HardHat}
          label="En cours"
          value={inProgress.data?.total}
          loading={inProgress.isLoading}
          color="bg-amber-100 text-amber-700"
          onClick={() => void navigate('/chantiers?status=IN_PROGRESS')}
        />
        <StatCard
          icon={FileSignature}
          label="À signer"
          value={awaitingSig.data?.total}
          loading={awaitingSig.isLoading}
          color="bg-orange-100 text-orange-700"
          onClick={() => void navigate('/chantiers?status=AWAITING_SIGNATURE')}
        />
        <StatCard
          icon={CheckCircle}
          label="Terminés"
          value={completed.data?.total}
          loading={completed.isLoading}
          color="bg-green-100 text-green-700"
          onClick={() => void navigate('/chantiers?status=COMPLETED')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Litiges"
          value={disputed.data?.total}
          loading={disputed.isLoading}
          color="bg-red-100 text-red-700"
          onClick={() => void navigate('/chantiers?status=DISPUTED')}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Chantiers récents</h2>
          <button
            className="flex min-h-[44px] items-center text-xs font-medium text-primary"
            onClick={() => void navigate('/chantiers')}
          >
            Voir tout
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {recent.isLoading &&
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-[72px] rounded-xl" />)}

          {recent.data?.data.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onClick={() => void navigate(`/chantiers/${project.id}`)}
            />
          ))}

          {!recent.isLoading && recent.data?.data.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun chantier pour le moment
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
