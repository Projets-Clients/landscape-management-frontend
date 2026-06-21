import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Camera, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoLightbox } from '@/components/common/PhotoLightbox'
import { usePhotos, useUploadPhoto } from '@/hooks/use-photos'
import { useProject } from '@/hooks/use-projects'
import type { Photo, PhotoType } from '@/types/api'

function PhotoSection({
  type,
  label,
  projectId,
  locked,
}: {
  type: PhotoType
  label: string
  projectId: string
  locked: boolean
}) {
  const { data: photos } = usePhotos(projectId)
  const upload = useUploadPhoto()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number; title: string } | null>(null)

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
        {!locked && (
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
        )}
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
        locked ? (
          <p className="text-sm text-muted-foreground italic">Aucune photo</p>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted py-4 text-muted-foreground transition-colors active:bg-muted"
          >
            <Camera className="h-5 w-5" />
            <span className="text-sm">Prendre une photo {label.toLowerCase()}</span>
          </button>
        )
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map((photo, i) => (
            <button key={photo.id} onClick={() => setLightbox({ photos: filtered, index: i, title: `Photos ${label.toLowerCase()}` })}>
              <img
                src={photo.signedUrl ?? ''}
                alt={`${label} ${photo.order}`}
                className="aspect-square w-full rounded-lg object-cover"
              />
            </button>
          ))}
          {!locked && (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted text-muted-foreground transition-colors active:bg-muted"
            >
              <Camera className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {lightbox && (
        <PhotoLightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          title={lightbox.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

const LOCKED_STATUSES = ['AWAITING_SIGNATURE', 'COMPLETED', 'DISPUTED']

export function PhotosPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project } = useProject(id ?? '')

  if (!id) return null

  const locked = project ? LOCKED_STATUSES.includes(project.status) : false

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

      {locked ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          Ce chantier est verrouillé. Les photos ne peuvent plus être ajoutées.
        </div>
      ) : (
        <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
          Les photos ne peuvent pas être supprimées après l'upload.
          Assurez-vous de la qualité avant de prendre la photo.
        </div>
      )}

      <PhotoSection type="BEFORE" label="Avant" projectId={id} locked={locked} />
      <PhotoSection type="AFTER" label="Après" projectId={id} locked={locked} />

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
