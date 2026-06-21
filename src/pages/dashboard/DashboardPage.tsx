import { useNavigate } from 'react-router-dom'
import { HardHat, Clock, FileSignature, CheckCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
}: {
  icon: React.ElementType
  label: string
  value: number | undefined
  loading: boolean
  color: string
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={`rounded-xl p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        {loading ? (
          <Skeleton className="mb-1 h-6 w-8" />
        ) : (
          <p className="text-2xl font-bold leading-none">{value ?? 0}</p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
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
  const recent = useProjects({ limit: 5 })

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Bonjour, {username}</h1>
          <p className="text-sm text-muted-foreground">Aperçu de l'activité</p>
        </div>
        {role === 'ADMIN' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="min-h-[44px]"
              onClick={() => void navigate('/clients/nouveau')}
            >
              <Plus className="mr-1 h-4 w-4" />
              Nouveau client
            </Button>
            <Button
              size="sm"
              className="min-h-[44px]"
              onClick={() => void navigate('/chantiers/nouveau')}
            >
              <Plus className="mr-1 h-4 w-4" />
              Nouveau chantier
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={HardHat}
          label="En cours"
          value={inProgress.data?.total}
          loading={inProgress.isLoading}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          icon={FileSignature}
          label="À signer"
          value={awaitingSig.data?.total}
          loading={awaitingSig.isLoading}
          color="bg-orange-100 text-orange-700"
        />
        <StatCard
          icon={CheckCircle}
          label="Terminés"
          value={completed.data?.total}
          loading={completed.isLoading}
          color="bg-green-100 text-green-700"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Chantiers récents</h2>
          <button
            className="flex min-h-[44px] items-center text-xs font-medium text-primary"
            onClick={() => void navigate('/chantiers')}
          >
            Voir tout
          </button>
        </div>

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

        {awaitingSig.data && awaitingSig.data.total > 0 && (
          <button
            className="flex min-h-[56px] w-full items-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 p-4 text-left"
            onClick={() =>
              void navigate('/chantiers?status=AWAITING_SIGNATURE')
            }
          >
            <Clock className="h-4 w-4 shrink-0 text-orange-600" />
            <p className="text-sm font-semibold text-orange-800">
              {awaitingSig.data.total} chantier
              {awaitingSig.data.total > 1 ? 's' : ''} en attente de signature
            </p>
          </button>
        )}
      </div>
    </div>
  )
}
