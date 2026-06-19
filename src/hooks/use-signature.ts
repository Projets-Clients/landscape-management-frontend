import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { PublicReport, SignatureRequest } from '@/types/api'

const API_URL = import.meta.env.VITE_API_URL as string

export function useCreateSignatureRequest(projectId: string) {
  return useMutation({
    mutationFn: () =>
      apiRequest<SignatureRequest>(`/projects/${projectId}/signature-requests`, {
        method: 'POST',
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
  })
}

export function usePublicReport(token: string) {
  return useQuery({
    queryKey: ['public', token],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/public/${token}`)
      if (!res.ok) throw new Error('Lien invalide ou expiré')
      return res.json() as Promise<PublicReport>
    },
    enabled: Boolean(token),
  })
}

interface SignInput {
  signerName: string
  validationCompleted: boolean
  validationConform: boolean
  signatureImage: string
}

export function useSign(token: string) {
  return useMutation({
    mutationFn: async (dto: SignInput) => {
      const res = await fetch(`${API_URL}/public/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? 'Erreur lors de la signature')
      }
      return res.json()
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['public', token] }),
  })
}
