import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreateProject } from '@/hooks/use-projects'
import { useClients } from '@/hooks/use-clients'

export function CreateProjectPage() {
  const navigate = useNavigate()
  const createProject = useCreateProject()
  const { data: clientsData, isLoading: loadingClients } = useClients({ active: true, limit: 100 })

  const [form, setForm] = useState({
    reference: '',
    title: '',
    address: '',
    clientId: '',
    description: '',
    quoteAmount: '',
    startDate: '',
    expectedEndDate: '',
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.reference || !form.title || !form.address || !form.clientId) {
      toast.error('Référence, titre, adresse et client sont obligatoires')
      return
    }
    try {
      const project = await createProject.mutateAsync({
        reference: form.reference.trim(),
        title: form.title.trim(),
        address: form.address.trim(),
        clientId: form.clientId,
        description: form.description.trim() || undefined,
        quoteAmount: form.quoteAmount ? parseFloat(form.quoteAmount) : undefined,
        startDate: form.startDate || undefined,
        expectedEndDate: form.expectedEndDate || undefined,
      })
      toast.success('Chantier créé')
      void navigate(`/chantiers/${project.id}`)
    } catch {
      toast.error('Erreur lors de la création')
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card active:bg-muted"
          onClick={() => void navigate('/chantiers')}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold">Nouveau chantier</h1>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reference">Référence *</Label>
          <Input
            id="reference"
            className="min-h-[44px]"
            value={form.reference}
            onChange={(e) => set('reference', e.target.value)}
            placeholder="Ex : CH-2026-001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Intitulé *</Label>
          <Input
            id="title"
            className="min-h-[44px]"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex : Aménagement terrasse"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Client *</Label>
          {loadingClients ? (
            <Skeleton className="h-[44px] rounded-md" />
          ) : (
            <select
              id="clientId"
              value={form.clientId}
              onChange={(e) => set('clientId', e.target.value)}
              className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Sélectionner un client</option>
              {clientsData?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse *</Label>
          <Input
            id="address"
            className="min-h-[44px]"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Adresse du chantier"
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

        <Button
          type="submit"
          className="w-full min-h-[48px] text-base"
          disabled={createProject.isPending}
        >
          {createProject.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Créer le chantier
        </Button>
      </form>
    </div>
  )
}
