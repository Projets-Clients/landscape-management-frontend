import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { apiRequest } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth.store'

interface UpdateMePayload {
  firstName?: string
  lastName?: string
  language?: string
  theme?: string
  accentColor?: string
  navSlots?: string[]
}

interface UpdateMeResponse {
  id: string
  username: string
  firstName: string
  lastName: string
}

export function useUpdateMe() {
  const { t } = useTranslation()
  const setName = useAuthStore((s) => s.setName)

  return useMutation({
    mutationFn: (data: UpdateMePayload) =>
      apiRequest<UpdateMeResponse>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (updated, variables) => {
      if (variables.firstName !== undefined || variables.lastName !== undefined) {
        setName(updated.firstName, updated.lastName)
        toast.success(t('settings.name_updated'))
      }
    },
    onError: () => {
      toast.error(t('settings.save_error'))
    },
  })
}
