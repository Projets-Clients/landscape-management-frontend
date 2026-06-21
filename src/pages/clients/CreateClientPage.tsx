import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AddressAutocomplete } from '@/components/common/AddressAutocomplete'
import { useCreateClient } from '@/hooks/use-clients'

export function CreateClientPage() {
  const navigate = useNavigate()
  const createClient = useCreateClient()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
    notes: '',
  })

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function formatPhone(value: string): string {
    const phone = parsePhoneNumberFromString(value, 'FR')
    return phone?.isValid() ? phone.formatNational() : value
  }

  function buildAddress() {
    const parts = [form.street.trim(), [form.postalCode.trim(), form.city.trim()].filter(Boolean).join(' ')].filter(Boolean)
    return parts.join(', ') || undefined
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Prénom, nom et email sont obligatoires')
      return
    }
    try {
      const client = await createClient.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        address: buildAddress(),
        notes: form.notes.trim() || undefined,
      })
      toast.success('Client créé')
      void navigate(`/clients/${client.id}`)
    } catch {
      toast.error('Erreur lors de la création')
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card active:bg-muted"
          onClick={() => void navigate('/clients')}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold">Nouveau client</h1>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              className="min-h-[44px]"
              value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              className="min-h-[44px]"
              value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            className="min-h-[44px]"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            className="min-h-[44px]"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            onBlur={(e) => set('phone', formatPhone(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Adresse</Label>
          <AddressAutocomplete
            placeholder="Numéro et rue"
            className="min-h-[44px]"
            value={form.street}
            onChange={(v) => set('street', v)}
            onSelect={(s) => setForm((f) => ({ ...f, street: s.street, postalCode: s.postalCode, city: s.city }))}
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

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Informations complémentaires…"
            className="min-h-[100px]"
          />
        </div>

        <Button
          type="submit"
          className="w-full min-h-[48px] text-base"
          disabled={createClient.isPending}
        >
          {createClient.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Créer le client
        </Button>
      </form>
    </div>
  )
}
