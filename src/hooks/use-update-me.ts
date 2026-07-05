import { useMutation } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api-client'

interface UpdateMePayload {
  language?: string
  theme?: string
  accentColor?: string
  navSlots?: string[]
}

export function useUpdateMe() {
  return useMutation({
    mutationFn: (data: UpdateMePayload) =>
      apiRequest('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  })
}
