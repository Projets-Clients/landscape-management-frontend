import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Plus, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useClients } from '@/hooks/use-clients'
import { fullName } from '@/lib/utils'

export function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useClients({ search: search || undefined, active: true })

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Clients</h1>
        <Button
          size="sm"
          className="min-h-[44px]"
          onClick={() => void navigate('/clients/nouveau')}
        >
          <Plus className="mr-1 h-4 w-4" />
          Nouveau
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="min-h-[44px] pl-9"
          placeholder="Rechercher un client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && data?.data.length === 0 && (
        <EmptyState
          icon={Users}
          title="Aucun client"
          description={search ? 'Aucun résultat pour cette recherche' : 'Créez votre premier client'}
          action={{ label: 'Nouveau client', onClick: () => void navigate('/clients/nouveau') }}
        />
      )}

      <div className="divide-y rounded-xl border bg-card overflow-hidden">
        {data?.data.map((client) => (
          <button
            key={client.id}
            onClick={() => void navigate(`/clients/${client.id}`)}
            className="flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{fullName(client)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {client.email}
                {client.phone && ` · ${client.phone}`}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
