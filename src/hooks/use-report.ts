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

export function useReportPdfUrl(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['report-pdf', projectId],
    queryFn: () => apiRequest<{ pdfUrl: string | null }>(`/projects/${projectId}/report/pdf-url`),
    enabled: Boolean(projectId) && enabled,
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

export function useGenerateReport(projectId: string) {
  return useMutation({
    mutationFn: () =>
      apiRequest<void>(`/projects/${projectId}/report/generate`, {
        method: 'POST',
      }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['report', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['report-pdf', projectId] }),
      ]),
  })
}

export function useSendReport(projectId: string) {
  return useMutation({
    mutationFn: () =>
      apiRequest<{ success: true }>(`/projects/${projectId}/report/send`, {
        method: 'POST',
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['report', projectId] }),
  })
}
