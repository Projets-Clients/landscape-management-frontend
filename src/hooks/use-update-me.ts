import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { apiRequest } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth.store'

interface UpdateMePayload {
  username?: string
  language?: string
  theme?: string
  accentColor?: string
  navSlots?: string[]
}

interface UpdateMeResponse {
  id: string
  username: string
}

export function useUpdateMe() {
  const { t } = useTranslation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const accessToken = useAuthStore((s) => s.accessToken)

  return useMutation({
    mutationFn: (data: UpdateMePayload) =>
      apiRequest<UpdateMeResponse>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (updated, variables) => {
      if (variables.username && accessToken) {
        setAuth(accessToken, updated.username)
        toast.success(t('settings.username_updated'))
      }
    },
    onError: (_, variables) => {
      if (variables.username) {
        toast.error(t('settings.username_taken'))
      }
    },
  })
}
