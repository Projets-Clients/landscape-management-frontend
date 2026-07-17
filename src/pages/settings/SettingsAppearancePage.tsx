import { useTranslation } from 'react-i18next'
import { Monitor, Sun, Moon, Hand } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useTheme, COLORS } from '@/providers/ThemeProvider'
import type { ColorKey, Handedness } from '@/providers/ThemeProvider'
import { patchMe } from '@/lib/patch-me'
import { SettingsSubHeader } from './SettingsSubHeader'

export function SettingsAppearancePage() {
  const { t } = useTranslation()
  const { theme, setTheme, color, setColor, handedness, setHandedness } = useTheme()

  function handleThemeChange(newTheme: 'system' | 'light' | 'dark') {
    setTheme(newTheme)
    patchMe({ theme: newTheme })
  }

  function handleColorChange(newColor: ColorKey) {
    setColor(newColor)
    patchMe({ accentColor: newColor })
  }

  function handleHandednessChange(h: Handedness) {
    setHandedness(h)
    patchMe({ handedness: h })
  }

  return (
    <div className="space-y-4 pb-4">
      <SettingsSubHeader title={t('settings.hub_appearance')} />

      <Card className="divide-y">
        {/* Thème */}
        <div className="p-3">
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { value: 'system', labelKey: 'settings.theme_system', icon: Monitor },
                { value: 'light',  labelKey: 'settings.theme_light',  icon: Sun },
                { value: 'dark',   labelKey: 'settings.theme_dark',   icon: Moon },
              ] as const
            ).map(({ value, labelKey, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={[
                  'flex flex-col items-center gap-1.5 rounded-md px-2 py-3 text-xs font-medium transition-colors',
                  theme === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Main dominante */}
        <div className="p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t('settings.handedness_section')}
          </p>
          <div className="grid grid-cols-2 gap-1">
            {(
              [
                { value: 'right', labelKey: 'settings.handedness_right', flip: false },
                { value: 'left',  labelKey: 'settings.handedness_left',  flip: true },
              ] as { value: Handedness; labelKey: string; flip: boolean }[]
            ).map(({ value, labelKey, flip }) => (
              <button
                key={value}
                onClick={() => handleHandednessChange(value)}
                className={[
                  'flex flex-col items-center gap-1.5 rounded-md px-2 py-3 text-xs font-medium transition-colors',
                  handedness === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                ].join(' ')}
              >
                <Hand className={['h-4 w-4', flip ? 'scale-x-[-1]' : ''].join(' ')} />
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Couleur */}
        <div className="p-3">
          <div className="grid grid-cols-4 gap-3">
            {(Object.entries(COLORS) as [ColorKey, (typeof COLORS)[ColorKey]][]).map(
              ([key, { hex }]) => (
                <button
                  key={key}
                  title={t(`settings.color_${key}`)}
                  onClick={() => handleColorChange(key)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full ring-offset-background transition-all"
                    style={{
                      backgroundColor: hex,
                      boxShadow:
                        color === key
                          ? `0 0 0 2px white, 0 0 0 4px ${hex}`
                          : undefined,
                    }}
                  >
                    {color === key && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white">
                        <path
                          d="M1.5 6.5l3 3 6-6"
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t(`settings.color_${key}`)}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
