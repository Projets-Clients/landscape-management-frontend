import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import type { Photo, PhotoType } from '@/types/api'

export function usePhotos(projectId: string) {
  return useQuery({
    queryKey: ['photos', projectId],
    queryFn: () => apiRequest<Photo[]>(`/projects/${projectId}/photos`),
    enabled: Boolean(projectId),
  })
}

interface UploadPhotoInput {
  projectId: string
  file: File
  type: PhotoType
  order?: number
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: ({ projectId, file, type, order }: UploadPhotoInput) => {
      const body = new FormData()
      body.append('file', file)
      body.append('type', type)
      if (order !== undefined) body.append('order', String(order))
      return apiRequest<Photo>(`/projects/${projectId}/photos`, {
        method: 'POST',
        body,
      })
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['photos', variables.projectId] }),
  })
}
