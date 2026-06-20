import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Euro,
  Camera,
  FileText,
  Send,
  AlertTriangle,
  Download,
  Users,
  ChevronRight,
  Loader2,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Stepper } from '@/components/common/Stepper'
import { Avatar } from '@/components/common/Avatar'
import { useProject, useUpdateProjectStatus, useAssignUsers, useUnassignUser } from '@/hooks/use-projects'
import { usePhotos } from '@/hooks/use-photos'
import { useReport, useReportPdfUrl } from '@/hooks/use-report'
import { useCreateSignatureRequest } from '@/hooks/use-signature'
import { useUsers } from '@/hooks/use-users'
import { useAuthStore } from '@/store/auth.store'
import { formatDate, formatCurrency, fullName } from '@/lib/utils'
import type { ProjectStatus } from '@/types/api'

const TRANSITION_LABELS: Partial<Record<ProjectStatus, string>> = {
  DRAFT: 'Planifier',
  PLANNED: 'Démarrer le chantier',
  IN_PROGRESS: 'Clôturer le chantier',
}

const NEXT_STATUS: Partial<Record<ProjectStatus, ProjectStatus>> = {
  DRAFT: 'PLANNED',
  PLANNED: 'IN_PROGRESS',
  IN_PROGRESS: 'AWAITING_SIGNATURE',
}

function canTransition(status: ProjectStatus, role: string | null): boolean {
  if (status === 'DRAFT') return role === 'ADMIN'
  if (status === 'PLANNED') return role === 'ADMIN' || role === 'FOREMAN'
  if (status === 'IN_PROGRESS') return role === 'ADMIN' || role === 'FOREMAN'
  return false
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)

  const { data: project, isLoading } = useProject(id ?? '')
  const { data: photos } = usePhotos(id ?? '')
  const { data: report } = useReport(id ?? '')
  const { data: pdfData } = useReportPdfUrl(id ?? '', project?.status === 'COMPLETED')
  const { data: allUsers } = useUsers({ enabled: role === 'ADMIN' })

  const updateStatus = useUpdateProjectStatus(id ?? '')
  const createSigRequest = useCreateSignatureRequest(id ?? '')
  const assignUsers = useAssignUsers(id ?? '')
  const unassignUser = useUnassignUser(id ?? '')

  if (isLoading) {
    return (
      <div className="space-y-4 pb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">Chantier introuvable</p>
        <Button variant="ghost" className="mt-4 min-h-[44px]" onClick={() => void navigate(-1)}>
          Retour
        </Button>
      </div>
    )
  }

  const beforePhotos = photos?.filter((p) => p.type === 'BEFORE') ?? []
  const afterPhotos = photos?.filter((p) => p.type === 'AFTER') ?? []
  const assignedUserIds = new Set(project.assignments.map((a) => a.userId))
  const assignedUsers = project.assignments.map((a) => a.user)

  async function handleTransition() {
    const next = NEXT_STATUS[project!.status]
    if (!next) return
    try {
      await updateStatus.mutateAsync(next)
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Impossible de changer le statut')
    }
  }

  async function handleSendSignature() {
    try {
      await createSigRequest.mutateAsync()
      toast.success('Lien de signature envoyé au client')
    } catch {
      toast.error('Erreur lors de l\'envoi')
    }
  }

  async function handleAssign(userId: string) {
    try {
      await assignUsers.mutateAsync([userId])
      toast.success('Membre ajouté')
    } catch {
      toast.error('Erreur lors de l\'assignation')
    }
  }

  async function handleUnassign(userId: string) {
    try {
      await unassignUser.mutateAsync(userId)
      toast.success('Membre retiré')
    } catch {
      toast.error('Erreur lors du retrait')
    }
  }

  const availableToAssign = allUsers?.filter((u) => !assignedUserIds.has(u.id)) ?? []

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card active:bg-muted"
          onClick={() => void navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">{project.reference}</span>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="mt-0.5 text-lg font-bold leading-snug">{project.title}</h1>
        </div>
        {role === 'ADMIN' && (
          <button
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card active:bg-muted"
            onClick={() => void navigate(`/chantiers/${id}/modifier`)}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* DISPUTED warning */}
      {project.status === 'DISPUTED' && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Chantier en litige</p>
            <p className="text-xs text-red-700 mt-0.5">
              Ce chantier fait l'objet d'un litige. Contactez le client pour résoudre la situation.
            </p>
          </div>
        </div>
      )}

      {/* Stepper */}
      {project.status !== 'DISPUTED' && (
        <Card className="p-4">
          <Stepper status={project.status} />
        </Card>
      )}

      {/* Action button */}
      {canTransition(project.status, role) && (
        <Button
          className="w-full min-h-[48px] text-base"
          onClick={() => void handleTransition()}
          disabled={updateStatus.isPending}
        >
          {updateStatus.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {TRANSITION_LABELS[project.status]}
        </Button>
      )}

      {/* Send signature link */}
      {project.status === 'AWAITING_SIGNATURE' && (role === 'ADMIN' || role === 'FOREMAN') && (
        <Button
          variant="outline"
          className="w-full min-h-[48px] gap-2"
          onClick={() => void handleSendSignature()}
          disabled={createSigRequest.isPending}
        >
          <Send className="h-4 w-4" />
          {createSigRequest.isPending ? 'Envoi…' : 'Envoyer le lien de signature'}
        </Button>
      )}

      {/* PDF download */}
      {project.status === 'COMPLETED' && pdfData?.pdfUrl && (
        <a
          href={pdfData.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Télécharger le rapport PDF
        </a>
      )}

      {/* Info */}
      <Card className="divide-y">
        <div className="flex items-start gap-3 p-4">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Adresse</p>
            <p className="text-sm font-medium">{project.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Client</p>
            <p className="text-sm font-medium">{fullName(project.client)}</p>
            {project.client.email && (
              <p className="text-xs text-muted-foreground">{project.client.email}</p>
            )}
          </div>
        </div>
        {(project.startDate || project.expectedEndDate) && (
          <div className="flex items-start gap-3 p-4">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Dates</p>
              <p className="text-sm">
                {formatDate(project.startDate)} → {formatDate(project.expectedEndDate)}
              </p>
            </div>
          </div>
        )}
        {project.quoteAmount && (
          <div className="flex items-start gap-3 p-4">
            <Euro className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Montant devis</p>
              <p className="text-sm font-semibold">{formatCurrency(project.quoteAmount)}</p>
            </div>
          </div>
        )}
        {project.description && (
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap">{project.description}</p>
          </div>
        )}
        {project.notes && (
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Notes internes</p>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{project.notes}</p>
          </div>
        )}
      </Card>

      {/* Team */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Équipe</h2>
        <Card className="divide-y">
          {assignedUsers.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Aucun membre assigné</p>
          )}
          {assignedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-4 min-h-[56px]">
              <Avatar id={user.id} firstName={user.firstName} lastName={user.lastName} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{fullName(user)}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role === 'FOREMAN' ? 'Chef d\'équipe' : 'Employé'}
                </p>
              </div>
              {role === 'ADMIN' && (
                <button
                  className="text-xs text-red-600 min-h-[44px] px-2"
                  onClick={() => void handleUnassign(user.id)}
                >
                  Retirer
                </button>
              )}
            </div>
          ))}
        </Card>

        {role === 'ADMIN' && availableToAssign.length > 0 && (
          <Card className="divide-y">
            <p className="p-3 text-xs font-medium text-muted-foreground">Ajouter un membre</p>
            {availableToAssign.map((user) => (
              <button
                key={user.id}
                onClick={() => void handleAssign(user.id)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-muted min-h-[56px]"
              >
                <Avatar id={user.id} firstName={user.firstName} lastName={user.lastName} size="sm" />
                <span className="flex-1 text-sm">{fullName(user)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Photos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Photos</h2>
          <button
            className="flex items-center gap-1 text-xs text-primary font-medium min-h-[44px]"
            onClick={() => void navigate(`/chantiers/${id}/photos`)}
          >
            <Camera className="h-3.5 w-3.5" />
            Gérer
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">AVANT ({beforePhotos.length})</p>
            {beforePhotos.length === 0 ? (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <Camera className="h-6 w-6 text-muted-foreground" />
              </div>
            ) : (
              <img
                src={beforePhotos[0].signedUrl ?? ''}
                alt="Avant"
                className="aspect-square w-full rounded-lg object-cover"
              />
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">APRÈS ({afterPhotos.length})</p>
            {afterPhotos.length === 0 ? (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <Camera className="h-6 w-6 text-muted-foreground" />
              </div>
            ) : (
              <img
                src={afterPhotos[0].signedUrl ?? ''}
                alt="Après"
                className="aspect-square w-full rounded-lg object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Report */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Rapport</h2>
          {(role === 'ADMIN' || role === 'FOREMAN') && (
            <button
              className="flex items-center gap-1 text-xs text-primary font-medium min-h-[44px]"
              onClick={() => void navigate(`/chantiers/${id}/rapport`)}
            >
              <FileText className="h-3.5 w-3.5" />
              Modifier
            </button>
          )}
        </div>
        <Card className="p-4">
          {report?.comment ? (
            <p className="text-sm whitespace-pre-wrap">{report.comment}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun commentaire saisi</p>
          )}
        </Card>
      </div>
    </div>
  )
}
