import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { User, UserRole } from '@/types/api'

export function useUsers(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiRequest<User[]>('/users'),
    enabled: options.enabled !== false,
  })
}

interface CreateUserInput {
  username: string
  firstName: string
  lastName: string
  password: string
  role: UserRole
  email?: string
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (dto: CreateUserInput) =>
      apiRequest<User>('/users', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

interface UpdateUserInput {
  firstName?: string
  lastName?: string
  password?: string
  role?: UserRole
  email?: string
  active?: boolean
}

export function useUpdateUser(id: string) {
  return useMutation({
    mutationFn: (dto: UpdateUserInput) =>
      apiRequest<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}
