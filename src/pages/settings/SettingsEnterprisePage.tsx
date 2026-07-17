import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Download, Loader2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useOrganization,
  useUpdateOrganization,
  useUploadLogo,
  useDeleteLogo,
} from '@/hooks/use-organization'
import { SettingsSubHeader } from './SettingsSubHeader'

export function SettingsEnterprisePage() {
  const { t } = useTranslation()
  const { data: org, isLoading: orgLoading } = useOrganization()
  const updateOrg = useUpdateOrganization()
  const uploadLogo = useUploadLogo()
  const deleteLogo = useDeleteLogo()

  const [orgName, setOrgName] = useState('')
  const [orgLanguage, setOrgLanguage] = useState('fr')
  const [logoPreviewOpen, setLogoPreviewOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (org) {
      setOrgName(org.name)
      setOrgLanguage(org.language ?? 'fr')
    }
  }, [org])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      toast.error(t('settings.logo_type_error'))
      return
    }
    void uploadLogo.mutateAsync(file, {
      onSuccess: () => toast.success(t('settings.logo_uploaded')),
      onError: () => toast.error(t('settings.logo_error')),
    })
    e.target.value = ''
  }

  function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgName.trim()) return
    void updateOrg.mutateAsync({ name: orgName.trim(), language: orgLanguage })
  }

  return (
    <>
      <div className="space-y-4 pb-4">
        <SettingsSubHeader title={t('settings.hub_enterprise')} />

        <Card className="p-4 space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            {org?.logoUrl ? (
              <button
                type="button"
                onClick={() => setLogoPreviewOpen(true)}
                className="shrink-0 rounded-lg border bg-muted overflow-hidden transition-opacity hover:opacity-80"
              >
                <img src={org.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
              </button>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground text-2xl font-bold">
                {org?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="logo-upload"
                  className={[
                    'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                    uploadLogo.isPending ? 'opacity-50 pointer-events-none' : '',
                  ].join(' ')}
                >
                  {uploadLogo.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {org?.logoUrl ? t('settings.logo_change_btn') : t('settings.logo_upload_btn')}
                </label>
                {org?.logoUrl && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
                    aria-label={t('settings.logo_delete_btn')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleLogoChange}
              />
              {showDeleteConfirm && (
                <div className="inline-flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm font-medium text-destructive">
                    {t('settings.logo_delete_warning')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleteLogo.isPending}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deleteLogo.isPending}
                      onClick={() =>
                        void deleteLogo.mutateAsync(undefined, {
                          onSuccess: () => {
                            setShowDeleteConfirm(false)
                            toast.success(t('settings.logo_deleted'))
                          },
                          onError: () => toast.error(t('settings.logo_error')),
                        })
                      }
                    >
                      {deleteLogo.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t('settings.logo_delete_btn')
                      )}
                    </Button>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{t('settings.logo_hint')}</p>
            </div>
          </div>

          {/* Formulaire */}
          {orgLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="orgName">{t('settings.org_name_label')}</Label>
                <Input
                  id="orgName"
                  className="min-h-[44px]"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  minLength={2}
                  maxLength={30}
                  required
                />
                <p
                  className={[
                    'text-right text-xs tabular-nums transition-colors',
                    orgName.length >= 30
                      ? 'text-destructive font-medium'
                      : orgName.length >= 25
                        ? 'text-orange-500'
                        : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {orgName.length}/30
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="orgLanguage">{t('settings.org_language_label')}</Label>
                <select
                  id="orgLanguage"
                  value={orgLanguage}
                  onChange={(e) => setOrgLanguage(e.target.value)}
                  className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="fr">{t('settings.lang_fr')}</option>
                  <option value="en">{t('settings.lang_en')}</option>
                  <option value="es">{t('settings.lang_es')}</option>
                  <option value="it">{t('settings.lang_it')}</option>
                  <option value="de">{t('settings.lang_de')}</option>
                </select>
              </div>
              <Button
                type="submit"
                className="w-full min-h-[44px]"
                disabled={
                  updateOrg.isPending ||
                  !orgName.trim() ||
                  (orgName.trim() === org?.name && orgLanguage === (org?.language ?? 'fr'))
                }
              >
                {updateOrg.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.save')}
              </Button>
            </form>
          )}
        </Card>
      </div>

      {/* Lightbox logo */}
      {logoPreviewOpen && org?.logoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLogoPreviewOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setLogoPreviewOpen(false)}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm outline-none"
        >
          <button
            onClick={() => setLogoPreviewOpen(false)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={org.logoUrl}
            alt="Logo"
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
