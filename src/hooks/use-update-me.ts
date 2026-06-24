import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth.store'

interface UpdateMeResponse {
  id: string
  username: string
}

export function useUpdateMe() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const accessToken = useAuthStore((s) => s.accessToken)

  return useMutation({
    mutationFn: (data: { username: string }) =>
      apiRequest<UpdateMeResponse>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      if (accessToken) {
        setAuth(accessToken, updated.username)
      }
      toast.success('Nom d\'utilisateur mis à jour')
    },
    onError: () => toast.error('Ce nom d\'utilisateur est déjà pris'),
  })
}
