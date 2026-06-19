import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Camera, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePhotos, useUploadPhoto } from '@/hooks/use-photos'
import type { PhotoType } from '@/types/api'

function PhotoSection({
  type,
  label,
  projectId,
}: {
  type: PhotoType
  label: string
  projectId: string
}) {
  const { data: photos } = usePhotos(projectId)
  const upload = useUploadPhoto()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const filtered = photos?.filter((p) => p.type === type) ?? []

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await upload.mutateAsync({
        projectId,
        file,
        type,
        order: filtered.length,
      })
      toast.success('Photo ajoutée')
    } catch {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {label} <span className="text-muted-foreground font-normal">({filtered.length})</span>
        </h2>
        <button
          className="flex min-h-[44px] min-w-[44px] items-center justify-center"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ImagePlus className="h-5 w-5 text-primary" />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFile(e)}
      />

      {filtered.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted py-10 text-muted-foreground transition-colors active:bg-muted"
        >
          <Camera className="h-8 w-8" />
          <span className="text-sm">Prendre une photo {label.toLowerCase()}</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((photo) => (
            <img
              key={photo.id}
              src={photo.signedUrl ?? ''}
              alt={`${label} ${photo.order}`}
              className="aspect-square rounded-lg object-cover"
            />
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted text-muted-foreground transition-colors active:bg-muted"
          >
            <Camera className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )
}

export function PhotosPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) return null

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card active:bg-muted"
          onClick={() => void navigate(`/chantiers/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold">Photos</h1>
      </div>

      <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
        Les photos ne peuvent pas être supprimées après l'upload.
        Assurez-vous de la qualité avant de prendre la photo.
      </div>

      <PhotoSection type="BEFORE" label="Avant" projectId={id} />
      <PhotoSection type="AFTER" label="Après" projectId={id} />

      <Button
        variant="outline"
        className="w-full min-h-[44px]"
        onClick={() => void navigate(`/chantiers/${id}`)}
      >
        Retour au chantier
      </Button>
    </div>
  )
}
