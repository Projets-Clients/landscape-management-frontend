import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Report } from '@/types/api'

export function useReport(projectId: string) {
  return useQuery({
    queryKey: ['report', projectId],
    queryFn: () => apiRequest<Report | null>(`/projects/${projectId}/report`),
    enabled: Boolean(projectId),
  })
}

export function useUpdateReport(projectId: string) {
  return useMutation({
    mutationFn: (comment: string) =>
      apiRequest<Report>(`/projects/${projectId}/report`, {
        method: 'PATCH',
        body: JSON.stringify({ comment }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['report', projectId] }),
  })
}
