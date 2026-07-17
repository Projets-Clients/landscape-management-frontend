import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Leaf, CheckCircle, XCircle, Loader2, RotateCcw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublicReport, useSign, useRefuse } from '@/hooks/use-signature'
import { formatDate } from '@/lib/utils'

function SignatureCanvas({
  onHasStrokes,
  canvasRef,
  placeholder,
  clearLabel,
}: {
  onHasStrokes: (v: boolean) => void
  canvasRef: React.RefObject<HTMLCanvasElement>
  placeholder: string
  clearLabel: string
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
            {placeholder}
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
          {clearLabel}
        </button>
      )}
    </div>
  )
}

const SUPPORTED_LANGS = ['fr', 'en', 'es', 'it', 'de']

export function SignPage() {
  const { i18n } = useTranslation()
  const browserLang = navigator.language.slice(0, 2)
  const lang = SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'fr'
  const t = i18n.getFixedT(lang)

  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const isOnsite = searchParams.get('back') === '1'
  const { data, isLoading, error } = usePublicReport(token ?? '')
  const sign = useSign(token ?? '')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [signerName, setSignerName] = useState('')
  const [validated, setValidated] = useState(false)
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
    if (!validated) {
      toast.error(t('sign.error_validation_required'))
      return
    }
    if (!canvas || !hasSignature) {
      toast.error(t('sign.error_sign_required'))
      return
    }
    if (!signerName.trim()) {
      toast.error(t('sign.error_name_required'))
      return
    }
    const dataUrl = canvas.toDataURL('image/png')
    const signatureImage = dataUrl.split(',')[1]
    if (!signatureImage) return

    try {
      await sign.mutateAsync({ signerName: signerName.trim(), validationCompleted: validated, validationConform: validated, signatureImage })
      setSigned(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('sign.error_sign_failed'))
    }
  }

  if (signed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('sign.success_title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('sign.success_desc')}</p>
        </div>
        {isOnsite ? (
          <button
            onClick={() => { window.location.href = `/chantiers/${data?.project.id}` }}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('sign.back_to_project')}
          </button>
        ) : data?.pdfUrl ? (
          <a
            href={data.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            {t('sign.pdf_ready')}
          </a>
        ) : (
          <p className="text-xs text-muted-foreground">{t('sign.pdf_generating')}</p>
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
          <h1 className="text-xl font-bold">{t('sign.refused_title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('sign.refused_desc')}</p>
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
        <p className="font-semibold">{t('sign.invalid_title')}</p>
        <p className="text-sm text-muted-foreground">{t('sign.invalid_desc')}</p>
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
          <h1 className="text-xl font-bold">{t('sign.already_refused_title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('sign.already_refused_desc')}</p>
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
          <h1 className="text-xl font-bold">{t('sign.already_signed_title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('sign.already_signed_desc')}</p>
        </div>
        {data.pdfUrl && (
          <a
            href={data.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            {t('sign.pdf_ready')}
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
        {isOnsite && (
          <button
            onClick={() => window.history.back()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-card"
            aria-label={t('sign.back_to_project')}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
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
        <p className="mb-1 text-xs text-muted-foreground">{t('sign.recipient')}</p>
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
          <h2 className="font-semibold">{t('sign.photos_section')}</h2>
          {beforePhotos.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{t('sign.photos_before')}</p>
              <div className="grid grid-cols-3 gap-2">
                {beforePhotos.map((p) => (
                  <img key={p.id} src={p.signedUrl ?? ''} alt={t('sign.photos_before')} className="aspect-square rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}
          {afterPhotos.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{t('sign.photos_after')}</p>
              <div className="grid grid-cols-3 gap-2">
                {afterPhotos.map((p) => (
                  <img key={p.id} src={p.signedUrl ?? ''} alt={t('sign.photos_after')} className="aspect-square rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {report && (report.lines.length > 0 || report.comment) && (
        <div className="space-y-3">
          <h2 className="font-semibold">{t('sign.report_section')}</h2>
          {report.lines.length > 0 && (
            <div className="space-y-1.5">
              {report.lines.map((line, i) => (
                <div key={i} className="rounded-xl bg-muted/50 px-4 py-2.5">
                  <p className="text-sm font-medium leading-snug">
                    {line.snapshotTitle}
                    {line.snapshotUnit && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({line.snapshotUnit})
                      </span>
                    )}
                  </p>
                  {line.complement && (
                    <p className="text-xs text-muted-foreground mt-0.5">{line.complement}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {report.comment && (
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="whitespace-pre-wrap text-sm">{report.comment}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-5 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">{t('sign.form_title')}</h2>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 rounded accent-primary"
            checked={validated}
            onChange={(e) => setValidated(e.target.checked)}
          />
          <span className="text-sm leading-snug">{t('sign.checkbox_agreement')}</span>
        </label>

        <div className="space-y-2">
          <Label htmlFor="signerName">{t('sign.signer_name')}</Label>
          <Input
            id="signerName"
            className="min-h-[44px]"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>{t('sign.signature_label')}</Label>
          <div className={!validated ? 'pointer-events-none opacity-40' : ''}>
            <SignatureCanvas canvasRef={canvasRef} onHasStrokes={setHasSignature} placeholder={t('sign.canvas_placeholder')} clearLabel={t('sign.canvas_clear')} />
          </div>
          {!validated && (
            <p className="text-xs text-muted-foreground">{t('sign.signature_locked')}</p>
          )}
        </div>

        <Button type="submit" className="w-full min-h-[52px] text-base" disabled={sign.isPending || refuse.isPending}>
          {sign.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {t('sign.submit_btn')}
        </Button>

        <div className="pt-2">
          {!showRefuseForm ? (
            <button
              type="button"
              onClick={() => setShowRefuseForm(true)}
              className="w-full text-sm text-muted-foreground underline-offset-4 hover:underline min-h-[44px]"
            >
              {t('sign.refuse_btn')}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">{t('sign.refuse_title')}</p>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={4}
                placeholder={t('sign.refuse_placeholder')}
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
                  {t('common.cancel')}
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
                      toast.error(err instanceof Error ? err.message : t('sign.error_refuse_failed'))
                    }
                  }}
                >
                  {refuse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('sign.refuse_confirm')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
