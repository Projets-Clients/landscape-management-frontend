import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'

export function PwaUpdatePrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (!needRefresh) return
    toast(t('common.update_available'), {
      duration: Infinity,
      action: {
        label: t('common.update_btn'),
        onClick: () => void updateServiceWorker(true),
      },
    })
  }, [needRefresh, t, updateServiceWorker])

  return null
}
