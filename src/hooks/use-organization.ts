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
    mutationFn: (data: { name?: string; navSlots?: string[]; language?: string }) =>
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

export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return apiRequest<{ logoUrl: string }>('/organizations/me/logo', {
        method: 'POST',
        body: form,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organization'] })
    },
  })
}

export function useDeleteLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiRequest('/organizations/me/logo', { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['organization'] })
    },
  })
}
