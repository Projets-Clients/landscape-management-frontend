import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Search, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AddressAutocomplete } from '@/components/common/AddressAutocomplete'
import { useCreateProject } from '@/hooks/use-projects'
import { useClients } from '@/hooks/use-clients'
import { buildAddress, parseAddress, fullName } from '@/lib/utils'
import type { Client } from '@/types/api'

function ClientSearch({
  value,
  onChange,
}: {
  value: Client | null
  onChange: (client: Client | null) => void
}) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const { data, isFetching } = useClients({
    search: debouncedSearch || undefined,
    active: true,
    limit: 8,
  })

  function select(client: Client) {
    onChange(client)
    setSearch('')
    setOpen(false)
  }

  function clear() {
    onChange(null)
    setSearch('')
  }

  if (value) {
    return (
      <div className="flex min-h-[44px] items-center gap-3 rounded-md border border-input bg-background px-3">
        <Check className="h-4 w-4 shrink-0 text-primary" />
        <span className="flex-1 text-sm font-medium">{fullName(value)}</span>
        <button type="button" onClick={clear} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="min-h-[44px] pl-9 pr-9"
          placeholder="Rechercher un client…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {search && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => { setSearch(''); setDebouncedSearch('') }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-md">
          {isFetching && (
            <li className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Recherche…
            </li>
          )}
          {!isFetching && data?.data.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-muted-foreground">Aucun client trouvé</li>
          )}
          {data?.data.map((client) => (
            <li key={client.id} className="border-b last:border-0">
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted active:bg-muted"
                onMouseDown={(e) => { e.preventDefault(); select(client) }}
              >
                <span className="font-medium">{fullName(client)}</span>
                {client.email && (
                  <span className="ml-2 text-xs text-muted-foreground">{client.email}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function CreateProjectPage() {
  const navigate = useNavigate()
  const createProject = useCreateProject()

  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [form, setForm] = useState({
    reference: '',
    title: '',
    street: '',
    postalCode: '',
    city: '',
    description: '',
    quoteAmount: '',
    startDate: '',
    expectedEndDate: '',
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleClientChange(client: Client | null) {
    setSelectedClient(client)
    if (client?.address) {
      const { street, postalCode, city } = parseAddress(client.address)
      setForm((f) => ({ ...f, street, postalCode, city }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const address = buildAddress(form.street, form.postalCode, form.city)
    if (!form.reference || !form.title || !address || !selectedClient) {
      toast.error('Référence, titre, adresse et client sont obligatoires')
      return
    }
    try {
      const project = await createProject.mutateAsync({
        reference: form.reference.trim(),
        title: form.title.trim(),
        address,
        clientId: selectedClient.id,
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
          <Label>Client *</Label>
          <ClientSearch value={selectedClient} onChange={handleClientChange} />
        </div>

        <div className="space-y-2">
          <Label>Adresse *</Label>
          <AddressAutocomplete
            placeholder="Numéro et rue"
            className="min-h-[44px]"
            value={form.street}
            onChange={(v) => set('street', v)}
            onSelect={(s) => setForm((f) => ({ ...f, street: s.street, postalCode: s.postalCode, city: s.city }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Code postal"
              className="min-h-[44px]"
              inputMode="numeric"
              autoComplete="postal-code"
              value={form.postalCode}
              onChange={(e) => set('postalCode', e.target.value)}
            />
            <Input
              placeholder="Ville"
              className="min-h-[44px]"
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </div>
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
