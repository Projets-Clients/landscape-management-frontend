import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Download, LogOut, Monitor, Moon, Sun, User, Loader2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth.store'
import { useTheme, COLORS } from '@/providers/ThemeProvider'
import type { ColorKey } from '@/providers/ThemeProvider'
import { apiRequest } from '@/lib/api-client'
import { useOrganization, useUpdateOrganization } from '@/hooks/use-organization'
import { NAV_SLOT_REGISTRY, DEFAULT_NAV_SLOTS, ALL_SLOT_KEYS, type NavSlotKey } from '@/lib/nav-slots'
import { useUpdateMe } from '@/hooks/use-update-me'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import { InstallModal } from '@/components/common/InstallModal'

export function SettingsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { username, role, userId, clearAuth } = useAuthStore()
  const isAdmin = role === 'ADMIN'
  const { theme, setTheme, color, setColor } = useTheme()
  const { isInstalled, isMobile } = usePwaInstall()
  const [installOpen, setInstallOpen] = useState(false)

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: t('settings.role_admin'),
    FOREMAN: t('settings.role_foreman'),
    EMPLOYEE: t('settings.role_employee'),
  }

  // Username change
  const [newUsername, setNewUsername] = useState(username)
  const updateMe = useUpdateMe()

  useEffect(() => { setNewUsername(username) }, [username])

  function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newUsername.trim()
    if (!trimmed || trimmed === username) return
    void updateMe.mutateAsync({ username: trimmed })
  }

  // Org name + nav slots (admin only)
  const { data: org, isLoading: orgLoading } = useOrganization()
  const updateOrg = useUpdateOrganization()
  const [orgName, setOrgName] = useState('')
  const [navSlots, setNavSlots] = useState<NavSlotKey[]>(DEFAULT_NAV_SLOTS)

  useEffect(() => {
    if (org) {
      setOrgName(org.name)
      setNavSlots((org.navSlots as NavSlotKey[]) ?? DEFAULT_NAV_SLOTS)
    }
  }, [org])

  function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgName.trim()) return
    void updateOrg.mutateAsync({ name: orgName.trim() })
  }

  function handleNavSlotChange(index: number, value: NavSlotKey) {
    setNavSlots((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  function handleNavSlotsSubmit(e: React.FormEvent) {
    e.preventDefault()
    void updateOrg.mutateAsync({ navSlots }).then(() => {
      toast.success(t('settings.nav_updated'))
    })
  }

  function handleThemeChange(newTheme: 'system' | 'light' | 'dark') {
    setTheme(newTheme)
    void apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify({ theme: newTheme }) })
  }

  function handleColorChange(newColor: ColorKey) {
    setColor(newColor)
    void apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify({ accentColor: newColor }) })
  }

  function handleLanguageChange(lang: string) {
    localStorage.setItem('landscape-lang', lang)
    void i18n.changeLanguage(lang)
    void apiRequest('/users/me', { method: 'PATCH', body: JSON.stringify({ language: lang }) }).then(() => {
      toast.success(t('settings.language_updated'))
    })
  }

  async function handleLogout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch {
      // ignore — clear locally regardless
    }
    clearAuth()
    void navigate('/login', { replace: true })
    toast.success(t('settings.logged_out'))
  }

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-xl font-bold">{t('settings.title')}</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className={[
          'flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold',
          userId ? 'bg-primary/10 text-primary' : 'bg-muted',
        ].join(' ')}>
          {userId ? username.charAt(0).toUpperCase() : <User className="h-7 w-7 text-muted-foreground" />}
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">{username}</p>
          {role && <p className="text-sm text-muted-foreground">{ROLE_LABELS[role] ?? role}</p>}
        </div>
      </div>

      {/* Grille : Mon compte + Organisation côte à côte sur desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* Mon compte */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t('settings.account_section')}</p>
          <Card className="divide-y">
            {/* Pseudo */}
            <div className="p-4">
              <form onSubmit={handleUsernameSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username">{t('settings.username_label')}</Label>
                  <Input
                    id="username"
                    className="min-h-[44px]"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    minLength={3}
                    maxLength={30}
                    pattern="^[a-zA-Z0-9_.\-]+$"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full min-h-[44px]"
                  disabled={updateMe.isPending || !newUsername.trim() || newUsername.trim() === username}
                >
                  {updateMe.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('settings.save')}
                </Button>
              </form>
            </div>
            {/* Langue */}
            <div className="p-4 space-y-1.5">
              <Label>{t('settings.language_section')}</Label>
              <select
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="fr">🇫🇷 {t('settings.lang_fr')}</option>
                <option value="en">🇬🇧 {t('settings.lang_en')}</option>
                <option value="es">🇪🇸 {t('settings.lang_es')}</option>
                <option value="it">🇮🇹 {t('settings.lang_it')}</option>
                <option value="de">🇩🇪 {t('settings.lang_de')}</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Organisation (admin seulement) */}
        {isAdmin && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t('settings.org_section')}</p>
            <Card className="divide-y">
              {orgLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Nom org */}
                  <div className="p-4">
                    <form onSubmit={handleOrgSubmit} className="space-y-3">
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
                        <p className={[
                          'text-right text-xs tabular-nums transition-colors',
                          orgName.length >= 30 ? 'text-destructive font-medium' :
                          orgName.length >= 25 ? 'text-orange-500' :
                          'text-muted-foreground',
                        ].join(' ')}>
                          {orgName.length}/30
                        </p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full min-h-[44px]"
                        disabled={updateOrg.isPending || !orgName.trim() || orgName.trim() === org?.name}
                      >
                        {updateOrg.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('settings.save')}
                      </Button>
                    </form>
                  </div>
                  {/* Navigation mobile */}
                  <div className="p-4">
                    <form onSubmit={handleNavSlotsSubmit} className="space-y-3">
                      <Label>{t('settings.nav_section')}</Label>
                      {navSlots.map((slot, i) => (
                        <select
                          key={i}
                          value={slot}
                          onChange={(e) => handleNavSlotChange(i, e.target.value as NavSlotKey)}
                          className="h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                          {ALL_SLOT_KEYS.map((key) => (
                            <option key={key} value={key}>
                              {t('settings.nav_slot', { n: i + 1 })} — {t(NAV_SLOT_REGISTRY[key].nameKey)}
                            </option>
                          ))}
                        </select>
                      ))}
                      <Button
                        type="submit"
                        className="w-full min-h-[44px]"
                        disabled={updateOrg.isPending}
                      >
                        {updateOrg.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('settings.save')}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Apparence : thème + couleur dans une seule card */}
      <div className="space-y-2">
        <p className="text-sm font-semibold">{t('settings.appearance_section')}</p>
        <Card className="divide-y">
          {/* Thème */}
          <div className="p-3">
            <div className="grid grid-cols-3 gap-1">
              {([
                { value: 'system', labelKey: 'settings.theme_system', icon: Monitor },
                { value: 'light',  labelKey: 'settings.theme_light',  icon: Sun },
                { value: 'dark',   labelKey: 'settings.theme_dark',   icon: Moon },
              ] as const).map(({ value, labelKey, icon: Icon }) => (
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
          {/* Couleur */}
          <div className="p-3">
            <div className="grid grid-cols-4 gap-3">
              {(Object.entries(COLORS) as [ColorKey, typeof COLORS[ColorKey]][]).map(([key, { hex }]) => (
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
                      boxShadow: color === key ? `0 0 0 2px white, 0 0 0 4px ${hex}` : undefined,
                    }}
                  >
                    {color === key && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white">
                        <path d="M1.5 6.5l3 3 6-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{t(`settings.color_${key}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* PWA */}
      {isMobile && !isInstalled && (
        <>
          <Button
            variant="outline"
            className="w-full min-h-[48px] gap-2"
            onClick={() => setInstallOpen(true)}
          >
            <Smartphone className="h-4 w-4" />
            {t('install.settings_btn')}
          </Button>
          <InstallModal open={installOpen} onClose={() => setInstallOpen(false)} />
        </>
      )}

      {isMobile && isInstalled && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          <Download className="h-3.5 w-3.5" />
          {t('install.installed_label')}
        </div>
      )}

      <Separator />

      <Button
        variant="destructive"
        className="w-full min-h-[48px] gap-2"
        onClick={() => void handleLogout()}
      >
        <LogOut className="h-4 w-4" />
        {t('settings.logout')}
      </Button>
    </div>
  )
}
