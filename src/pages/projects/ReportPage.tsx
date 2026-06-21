import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useReport, useUpdateReport } from '@/hooks/use-report'
import { useProject } from '@/hooks/use-projects'
import { useAuthStore } from '@/store/auth.store'

export function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)

  const { data: project } = useProject(id ?? '')
  const { data: report, isLoading } = useReport(id ?? '')
  const updateReport = useUpdateReport(id ?? '')

  const [comment, setComment] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (report?.comment !== undefined) {
      setComment(report.comment ?? '')
    }
  }, [report?.comment])

  const canEdit = role === 'ADMIN' || role === 'FOREMAN'
  const isLocked = project?.status === 'AWAITING_SIGNATURE' || project?.status === 'COMPLETED' || project?.status === 'DISPUTED'

  async function handleSave() {
    try {
      await updateReport.mutateAsync(comment)
      setDirty(false)
      toast.success('Rapport enregistré')
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card active:bg-muted"
            onClick={() => void navigate(`/chantiers/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-bold">Rapport</h1>
        </div>
        {canEdit && !isLocked && dirty && (
          <Button
            size="sm"
            className="min-h-[44px] gap-1.5"
            onClick={() => void handleSave()}
            disabled={updateReport.isPending}
          >
            {updateReport.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Enregistrer
          </Button>
        )}
      </div>

      {project && (
        <div className="text-sm text-muted-foreground">
          {project.reference} · {project.title}
        </div>
      )}

      {isLocked && (
        <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          Le rapport est verrouillé après signature.
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="comment">Commentaire de fin de chantier</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value)
              setDirty(true)
            }}
            disabled={!canEdit || isLocked}
            placeholder={
              canEdit && !isLocked
                ? 'Décrivez le déroulement des travaux, les observations particulières…'
                : 'Aucun commentaire'
            }
            className="min-h-[200px] text-sm"
            readOnly={!canEdit || isLocked}
          />
        </div>
      )}

      {canEdit && !isLocked && (
        <Button
          className="w-full min-h-[48px]"
          onClick={() => void handleSave()}
          disabled={updateReport.isPending || !dirty}
        >
          {updateReport.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {dirty ? 'Enregistrer' : 'Enregistré'}
        </Button>
      )}
    </div>
  )
}
