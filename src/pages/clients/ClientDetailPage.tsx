import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Mail, Phone, MapPin, FileText, Loader2 } from 'lucide-react'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AddressAutocomplete } from '@/components/common/AddressAutocomplete'
import { useClient, useUpdateClient, useDeactivateClient } from '@/hooks/use-clients'
import { useProjects } from '@/hooks/use-projects'
import { fullName, formatDate, buildAddress, parseAddress } from '@/lib/utils'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

  const { data: client, isLoading } = useClient(id ?? '')
  const { data: projects } = useProjects({ clientId: id })
  const updateClient = useUpdateClient(id ?? '')
  const deactivate = useDeactivateClient(id ?? '')

  const [form, setForm] = useState<{
    firstName: string
    lastName: string
    email: string
    phone: string
    street: string
    postalCode: string
    city: string
    notes: string
  } | null>(null)

  function startEdit() {
    if (!client) return
    const { street, postalCode, city } = parseAddress(client.address ?? '')
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone ?? '',
      street,
      postalCode,
      city,
      notes: client.notes ?? '',
    })
    setEditing(true)
  }

  function formatPhone(value: string): string {
    const phone = parsePhoneNumberFromString(value, 'FR')
    return phone?.isValid() ? phone.formatNational() : value
  }

  async function handleSave() {
    if (!form) return
    try {
      await updateClient.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        address: buildAddress(form.street, form.postalCode, form.city),
        notes: form.notes.trim() || undefined,
      })
      toast.success('Client mis à jour')
      setEditing(false)
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  async function handleDeactivate() {
    if (!confirm('Désactiver ce client ? Il ne sera plus accessible dans les formulaires.')) return
    try {
      await deactivate.mutateAsync()
      toast.success('Client désactivé')
      void navigate('/clients')
    } catch {
      toast.error('Erreur lors de la désactivation')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 pb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card active:bg-muted"
            onClick={() => void navigate('/clients')}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-bold">{fullName(client)}</h1>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" className="min-h-[44px]" onClick={startEdit}>
            Modifier
          </Button>
        )}
      </div>

      {editing && form ? (
        <Card className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input
                className="min-h-[44px]"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                className="min-h-[44px]"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              className="min-h-[44px]"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input
              className="min-h-[44px]"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              onBlur={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <AddressAutocomplete
              placeholder="Numéro et rue"
              className="min-h-[44px]"
              value={form.street}
              onChange={(v) => setForm({ ...form, street: v })}
              onSelect={(s) => setForm({ ...form, street: s.street, postalCode: s.postalCode, city: s.city })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Code postal"
                className="min-h-[44px]"
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              />
              <Input
                placeholder="Ville"
                className="min-h-[44px]"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={() => setEditing(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 min-h-[44px]"
              onClick={() => void handleSave()}
              disabled={updateClient.isPending}
            >
              {updateClient.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="divide-y">
          <div className="flex items-center gap-3 p-4 min-h-[56px]">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm">{client.email}</p>
          </div>
          {client.phone && (
            <div className="flex items-center gap-3 p-4 min-h-[56px]">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm">{client.phone}</p>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-3 p-4 min-h-[56px]">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm">{client.address}</p>
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-3 p-4">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </Card>
      )}

      {projects?.data && projects.data.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Chantiers ({projects.total})</h2>
          <div className="space-y-2">
            {projects.data.map((p) => (
              <button
                key={p.id}
                onClick={() => void navigate(`/chantiers/${p.id}`)}
                className="flex min-h-[64px] w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors active:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.reference} · {formatDate(p.expectedEndDate)}</p>
                </div>
                <StatusBadge status={p.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="destructive"
        className="w-full min-h-[44px]"
        onClick={() => void handleDeactivate()}
        disabled={deactivate.isPending}
      >
        Désactiver le client
      </Button>
    </div>
  )
}
