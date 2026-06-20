import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useProject, useUpdateProject } from '@/hooks/use-projects'

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id ?? '')
  const updateProject = useUpdateProject(id ?? '')

  const [form, setForm] = useState({
    title: '',
    address: '',
    description: '',
    notes: '',
    quoteAmount: '',
    startDate: '',
    expectedEndDate: '',
  })

  useEffect(() => {
    if (!project) return
    setForm({
      title: project.title,
      address: project.address,
      description: project.description ?? '',
      notes: project.notes ?? '',
      quoteAmount: project.quoteAmount ?? '',
      startDate: project.startDate ?? '',
      expectedEndDate: project.expectedEndDate ?? '',
    })
  }, [project])

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.address.trim()) {
      toast.error('Titre et adresse sont obligatoires')
      return
    }
    try {
      await updateProject.mutateAsync({
        title: form.title.trim(),
        address: form.address.trim(),
        description: form.description.trim() || undefined,
        notes: form.notes.trim() || undefined,
        quoteAmount: form.quoteAmount ? parseFloat(form.quoteAmount) : undefined,
        startDate: form.startDate || undefined,
        expectedEndDate: form.expectedEndDate || undefined,
      })
      toast.success('Chantier mis à jour')
      void navigate(`/chantiers/${id ?? ''}`)
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 pb-4">
        <Skeleton className="h-6 w-48" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[44px] rounded-md" />
        ))}
      </div>
    )
  }

  if (!project) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Chantier introuvable</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card active:bg-muted"
          onClick={() => void navigate(`/chantiers/${id ?? ''}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-mono text-muted-foreground">{project.reference}</p>
          <h1 className="text-lg font-bold">Modifier le chantier</h1>
        </div>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Intitulé *</Label>
          <Input
            id="title"
            className="min-h-[44px]"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse *</Label>
          <Input
            id="address"
            className="min-h-[44px]"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              className="min-h-[44px]"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedEndDate">Date de fin</Label>
            <Input
              id="expectedEndDate"
              type="date"
              className="min-h-[44px]"
              value={form.expectedEndDate}
              onChange={(e) => set('expectedEndDate', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quoteAmount">Montant devis (€)</Label>
          <Input
            id="quoteAmount"
            type="number"
            min="0"
            step="0.01"
            className="min-h-[44px]"
            value={form.quoteAmount}
            onChange={(e) => set('quoteAmount', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Description des travaux…"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes internes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Notes pour l'équipe…"
            className="min-h-[80px]"
          />
        </div>

        <Button
          type="submit"
          className="w-full min-h-[48px] text-base"
          disabled={updateProject.isPending}
        >
          {updateProject.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Enregistrer
        </Button>
      </form>
    </div>
  )
}
