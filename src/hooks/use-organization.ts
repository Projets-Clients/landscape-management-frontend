import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api-client'
import type { Organization } from '@/types/api'

export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: () => apiRequest<Organization>('/organizations/me'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; navSlots?: string[] }) =>
      apiRequest<Organization>('/organizations/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organization'] })
      toast.success('Organisation mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}
