import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Leaf, CheckCircle, XCircle, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublicReport, useSign, useRefuse } from '@/hooks/use-signature'
import { formatDate } from '@/lib/utils'

function SignatureCanvas({
  onHasStrokes,
  canvasRef,
}: {
  onHasStrokes: (v: boolean) => void
  canvasRef: React.RefObject<HTMLCanvasElement>
}) {
  const [drawing, setDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setDrawing(true)
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e, canvas)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    if (!hasStrokes) {
      setHasStrokes(true)
      onHasStrokes(true)
    }
  }

  function end() {
    setDrawing(false)
  }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx?.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
    onHasStrokes(false)
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-input bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full touch-none"
          style={{ height: 160 }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        {!hasStrokes && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Signez ici
          </div>
        )}
      </div>
      {hasStrokes && (
        <button
          type="button"
          onClick={clear}
          className="flex min-h-[44px] items-center gap-1 text-xs text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Effacer et recommencer
        </button>
      )}
    </div>
  )
}

export function SignPage() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading, error } = usePublicReport(token ?? '')
  const sign = useSign(token ?? '')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [signerName, setSignerName] = useState('')
  const [validationCompleted, setValidationCompleted] = useState(false)
  const [validationConform, setValidationConform] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signed, setSigned] = useState(false)
  const [showRefuseForm, setShowRefuseForm] = useState(false)
  const [refuseComment, setRefuseComment] = useState('')
  const [refused, setRefused] = useState(false)
  const refuse = useRefuse(token ?? '')

  useEffect(() => {
    if (data?.client) {
      setSignerName(`${data.client.firstName} ${data.client.lastName}`)
    }
  }, [data?.client])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) {
      toast.error('Veuillez signer le document')
      return
    }
    if (!signerName.trim()) {
      toast.error('Veuillez indiquer votre nom')
      return
    }
    const dataUrl = canvas.toDataURL('image/png')
    const signatureImage = dataUrl.split(',')[1]
    if (!signatureImage) return

    try {
      await sign.mutateAsync({ signerName: signerName.trim(), validationCompleted, validationConform, signatureImage })
      setSigned(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la signature')
    }
  }

  if (signed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Signature enregistrée</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Merci. Le rapport signé vous sera envoyé par email.
          </p>
        </div>
        {data?.pdfUrl ? (
          <a
            href={data.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Télécharger le rapport PDF
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">
            Le rapport PDF est en cours de génération, vous le recevrez par email.
          </p>
        )}
      </div>
    )
  }

  if (refused) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <XCircle className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Refus enregistré</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Votre refus a bien été transmis. L'entreprise prendra contact avec vous.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-semibold">Lien invalide ou expiré</p>
        <p className="text-sm text-muted-foreground">
          Ce lien de signature n'est plus valide. Contactez votre prestataire.
        </p>
      </div>
    )
  }

  if (data.alreadyRefused) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <XCircle className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Document refusé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vous avez refusé de signer ce rapport. L'entreprise va prendre contact avec vous.
          </p>
          {data.refusalComment && (
            <p className="mt-3 rounded-lg bg-muted p-3 text-left text-sm italic text-muted-foreground">
              « {data.refusalComment} »
            </p>
          )}
        </div>
      </div>
    )
  }

  if (data.alreadySigned) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Document déjà signé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ce rapport a déjà été signé. Merci pour votre confiance.
          </p>
        </div>
        {data.pdfUrl && (
          <a
            href={data.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Télécharger le rapport PDF
          </a>
        )}
      </div>
    )
  }

  const { project, client, report, photos } = data
  const beforePhotos = photos.filter((p) => p.type === 'BEFORE')
  const afterPhotos = photos.filter((p) => p.type === 'AFTER')

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pb-12">
      <div className="flex items-center gap-2 pt-2">
        <Leaf className="h-5 w-5 text-primary" />
        <span className="font-bold">Landscape</span>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{project.reference}</p>
        <h1 className="text-xl font-bold">{project.title}</h1>
        <p className="text-sm text-muted-foreground">{project.address}</p>
        {(project.startDate ?? project.expectedEndDate) && (
          <p className="text-xs text-muted-foreground">
            {formatDate(project.startDate)} → {formatDate(project.expectedEndDate)}
          </p>
        )}
      </div>

      <div className="rounded-xl bg-muted/50 p-4">
        <p className="mb-1 text-xs text-muted-foreground">Destinataire</p>
        <p className="font-semibold">
          {client.firstName} {client.lastName}
        </p>
        {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground">{project.description}</p>
      )}

      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <div className="space-y-3">
          <h2 className="font-semibold">Photos des travaux</h2>
          {beforePhotos.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">AVANT</p>
              <div className="grid grid-cols-3 gap-2">
                {beforePhotos.map((p) => (
                  <img key={p.id} src={p.signedUrl ?? ''} alt="Avant" className="aspect-square rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}
          {afterPhotos.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">APRÈS</p>
              <div className="grid grid-cols-3 gap-2">
                {afterPhotos.map((p) => (
                  <img key={p.id} src={p.signedUrl ?? ''} alt="Après" className="aspect-square rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {report?.comment && (
        <div className="space-y-2">
          <h2 className="font-semibold">Rapport d'intervention</h2>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="whitespace-pre-wrap text-sm">{report.comment}</p>
          </div>
        </div>
      )}

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-5 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Validation et signature</h2>

        <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 rounded accent-primary"
            checked={validationCompleted}
            onChange={(e) => setValidationCompleted(e.target.checked)}
          />
          <span className="text-sm">Je confirme que les travaux décrits ont bien été réalisés.</span>
        </label>

        <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 rounded accent-primary"
            checked={validationConform}
            onChange={(e) => setValidationConform(e.target.checked)}
          />
          <span className="text-sm">Je confirme que les travaux sont conformes au devis initial.</span>
        </label>

        <div className="space-y-2">
          <Label htmlFor="signerName">Nom du signataire</Label>
          <Input
            id="signerName"
            className="min-h-[44px]"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Signature</Label>
          <SignatureCanvas canvasRef={canvasRef} onHasStrokes={setHasSignature} />
        </div>

        <Button type="submit" className="w-full min-h-[52px] text-base" disabled={sign.isPending || refuse.isPending}>
          {sign.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Signer et valider
        </Button>

        <div className="pt-2">
          {!showRefuseForm ? (
            <button
              type="button"
              onClick={() => setShowRefuseForm(true)}
              className="w-full text-sm text-muted-foreground underline-offset-4 hover:underline min-h-[44px]"
            >
              Refuser les travaux
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">Motif du refus</p>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={4}
                placeholder="Décrivez ce qui ne vous convient pas..."
                value={refuseComment}
                onChange={(e) => setRefuseComment(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                  onClick={() => { setShowRefuseForm(false); setRefuseComment('') }}
                  disabled={refuse.isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1 min-h-[44px]"
                  disabled={!refuseComment.trim() || refuse.isPending}
                  onClick={async () => {
                    try {
                      await refuse.mutateAsync({ comment: refuseComment.trim() })
                      setRefused(true)
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Erreur')
                    }
                  }}
                >
                  {refuse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer le refus'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
