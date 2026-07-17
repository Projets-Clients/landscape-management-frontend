import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Download,
  Hand,
  LayoutDashboard,
  Minus,
  Monitor,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  Loader2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { usePermissions } from "@/hooks/use-permissions";
import { useTheme, COLORS } from "@/providers/ThemeProvider";
import type { ColorKey, Handedness } from "@/providers/ThemeProvider";
const API_URL = import.meta.env.VITE_API_URL

// Fire-and-forget preference update — never triggers logout on token expiry
function patchMe(body: object) {
  const token = useAuthStore.getState().accessToken
  if (!token) return
  void fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).catch(() => {})
}
import {
  useOrganization,
  useUpdateOrganization,
  useUploadLogo,
} from "@/hooks/use-organization";
import {
  NAV_SLOT_REGISTRY,
  SLOT_TO_PERM_MODULE,
  DEFAULT_NAV_SLOTS,
  ALL_SLOT_KEYS,
  type NavSlotKey,
} from "@/lib/nav-slots";
import { useUpdateMe } from "@/hooks/use-update-me";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { InstallModal } from "@/components/common/InstallModal";

export function SettingsPage() {
const { t, i18n } = useTranslation();
  const { username, role } = useAuthStore();
  const setNavSlots = useAuthStore((s) => s.setNavSlots);
  const storeNavSlots = useAuthStore((s) => s.navSlots);
  const { isAdmin, can } = usePermissions();
  const { theme, setTheme, color, setColor, handedness, setHandedness } = useTheme();
  const { isInstalled, isMobile } = usePwaInstall();
  const [installOpen, setInstallOpen] = useState(false);

const updateMe = useUpdateMe();

  // Org name + nav slots (admin only)
  const { data: org, isLoading: orgLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const uploadLogo = useUploadLogo();
  const [orgName, setOrgName] = useState("");
  const [orgLanguage, setOrgLanguage] = useState("fr");
  const [navSlotsLocal, setNavSlotsLocal] =
    useState<NavSlotKey[]>(DEFAULT_NAV_SLOTS);

  useEffect(() => {
    if (org) {
      setOrgName(org.name);
      setOrgLanguage(org.language ?? "fr");
      setNavSlotsLocal((org.navSlots as NavSlotKey[]) ?? DEFAULT_NAV_SLOTS);
    }
  }, [org]);

  function handleOrgSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    void updateOrg.mutateAsync({
      name: orgName.trim(),
      language: orgLanguage,
      navSlots: navSlotsLocal,
    });
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error(t('settings.logo_type_error'));
      return;
    }
    void uploadLogo.mutateAsync(file, {
      onSuccess: () => toast.success(t('settings.logo_uploaded')),
      onError: () => toast.error(t('settings.logo_error')),
    });
    e.target.value = '';
  }

  function handleNavSlotChange(index: number, value: NavSlotKey) {
    setNavSlotsLocal((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function handleAddOrgSlot() {
    const available = ALL_SLOT_KEYS.filter((k) => !navSlotsLocal.includes(k));
    if (available.length > 0 && navSlotsLocal.length < 4) {
      setNavSlotsLocal((prev) => [...prev, available[0]]);
    }
  }

  function handleRemoveOrgSlot(index: number) {
    if (navSlotsLocal.length > 1) {
      setNavSlotsLocal((prev) => prev.filter((_, i) => i !== index));
    }
  }

  // User nav slots (MEMBER only)
  const accessibleSlots = ALL_SLOT_KEYS.filter((key) =>
    can(SLOT_TO_PERM_MODULE[key], "read"),
  );
  const [userNav, setUserNav] = useState<NavSlotKey[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [navSaving, setNavSaving] = useState(false);

  useEffect(() => {
    setUserNav(storeNavSlots as NavSlotKey[]);
  }, [storeNavSlots]);

  function handleUserSlotChange(index: number, value: NavSlotKey) {
    setUserNav((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function handleAddSlot() {
    const available = accessibleSlots.filter((k) => !userNav.includes(k));
    if (available.length > 0 && userNav.length < 4) {
      setUserNav((prev) => [...prev, available[0]]);
    }
  }

  function handleRemoveSlot(index: number) {
    setUserNav((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveUserNav() {
    setNavSaving(true);
    try {
      await updateMe.mutateAsync({ navSlots: userNav });
      setNavSlots(userNav);
      toast.success(t("settings.nav_updated"));
    } catch {
      toast.error(t("settings.save"));
    } finally {
      setNavSaving(false);
    }
  }

  async function handleResetUserNav() {
    const orgDefaults = (org?.navSlots as NavSlotKey[]) ?? DEFAULT_NAV_SLOTS;
    const reset = orgDefaults.filter((k) => accessibleSlots.includes(k));
    setShowResetConfirm(false);
    setNavSaving(true);
    try {
      await updateMe.mutateAsync({ navSlots: reset });
      setUserNav(reset);
      setNavSlots(reset);
      toast.success(t("settings.nav_updated"));
    } catch {
      toast.error(t("settings.save"));
    } finally {
      setNavSaving(false);
    }
  }

  function handleThemeChange(newTheme: "system" | "light" | "dark") {
    setTheme(newTheme);
    patchMe({ theme: newTheme });
  }

  function handleColorChange(newColor: ColorKey) {
    setColor(newColor);
    patchMe({ accentColor: newColor });
  }

  function handleHandednessChange(h: Handedness) {
    setHandedness(h);
    patchMe({ handedness: h });
  }

  function handleLanguageChange(lang: string) {
    localStorage.setItem("landscape-lang", lang);
    void i18n.changeLanguage(lang).then(() => {
      toast.success(i18n.getFixedT(lang)("settings.language_updated"));
    });
    patchMe({ language: lang });
  }

return (
    <div className="space-y-6 pb-4">
      <h1 className="text-xl font-bold">{t("settings.title")}</h1>

{/* Grille : Mon compte + Organisation côte à côte sur desktop */}
      <div className="space-y-4">
        {/* Mon compte */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            {t("settings.account_section")}
          </p>
          <Card className="divide-y">
            {/* Identifiant de connexion — lecture seule */}
            <div className="p-4 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {t("settings.identifier_label")}
              </p>
              <p className="rounded-md border bg-muted/40 px-3 py-2.5 text-sm font-mono">
                {username}
              </p>
            </div>
            {/* Langue */}
            <div className="p-4 space-y-1.5">
              <Label>{t("settings.language_section")}</Label>
              <select
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="fr">🇫🇷 {t("settings.lang_fr")}</option>
                <option value="en">🇬🇧 {t("settings.lang_en")}</option>
                <option value="es">🇪🇸 {t("settings.lang_es")}</option>
                <option value="it">🇮🇹 {t("settings.lang_it")}</option>
                <option value="de">🇩🇪 {t("settings.lang_de")}</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Organisation (admin seulement) */}
        {isAdmin && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t("settings.org_section")}</p>

            {/* Logo */}
            <Card className="p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("settings.logo_section")}
              </p>
              <div className="flex items-center gap-4">
                {org?.logoUrl ? (
                  <img
                    src={org.logoUrl}
                    alt="Logo"
                    className="h-16 w-16 rounded-lg object-contain border bg-muted"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-muted-foreground text-2xl font-bold">
                    {org?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="logo-upload"
                    className={[
                      "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-muted",
                      uploadLogo.isPending ? "opacity-50 pointer-events-none" : "",
                    ].join(" ")}
                  >
                    {uploadLogo.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {org?.logoUrl ? t("settings.logo_change_btn") : t("settings.logo_upload_btn")}
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-muted-foreground">{t("settings.logo_hint")}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              {orgLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={handleOrgSubmit} className="space-y-4">
                  {/* Nom */}
                  <div className="space-y-1.5">
                    <Label htmlFor="orgName">
                      {t("settings.org_name_label")}
                    </Label>
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
                        "text-right text-xs tabular-nums transition-colors",
                        orgName.length >= 30
                          ? "text-destructive font-medium"
                          : orgName.length >= 25
                            ? "text-orange-500"
                            : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {orgName.length}/30
                    </p>
                  </div>
                  {/* Langue des documents */}
                  <div className="space-y-1.5">
                    <Label htmlFor="orgLanguage">
                      {t("settings.org_language_label")}
                    </Label>
                    <select
                      id="orgLanguage"
                      value={orgLanguage}
                      onChange={(e) => setOrgLanguage(e.target.value)}
                      className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="fr">{t("settings.lang_fr")}</option>
                      <option value="en">{t("settings.lang_en")}</option>
                      <option value="es">{t("settings.lang_es")}</option>
                      <option value="it">{t("settings.lang_it")}</option>
                      <option value="de">{t("settings.lang_de")}</option>
                    </select>
                  </div>
                  {/* Navigation mobile */}
                  <div>
                    <Label className="mb-5 block">
                      {t("settings.nav_section")}
                    </Label>
                    {/* Mobile : selects avec label flottant + boutons +/- */}
                    <div className="lg:hidden space-y-3">
                      {navSlotsLocal.map((slot, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute -top-2 left-3 z-10 bg-card px-1 text-[10px] text-muted-foreground leading-none">
                              {t("settings.nav_slot", { n: i + 1 })}
                            </span>
                            <select
                              value={slot}
                              onChange={(e) =>
                                handleNavSlotChange(
                                  i,
                                  e.target.value as NavSlotKey,
                                )
                              }
                              className="h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                              {ALL_SLOT_KEYS.filter(
                                (key) =>
                                  key === slot || !navSlotsLocal.includes(key),
                              ).map((key) => (
                                <option key={key} value={key}>
                                  {t(NAV_SLOT_REGISTRY[key].nameKey)}
                                </option>
                              ))}
                            </select>
                          </div>
                          {navSlotsLocal.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOrgSlot(i)}
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {navSlotsLocal.length < 4 &&
                        ALL_SLOT_KEYS.filter((k) => !navSlotsLocal.includes(k))
                          .length > 0 && (
                          <button
                            type="button"
                            onClick={handleAddOrgSlot}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
                          >
                            <Plus className="h-4 w-4" />
                            {t("settings.nav_add_slot")}
                          </button>
                        )}
                    </div>
                    {/* Desktop : simulation de la barre de nav (grille dynamique) */}
                    <div className="hidden lg:block rounded-xl border overflow-hidden">
                      <div
                        className="bg-background border-b"
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${navSlotsLocal.length + 1}, 1fr)`,
                        }}
                      >
                        <div className="flex flex-col items-center gap-0.5 py-2 opacity-35">
                          <LayoutDashboard className="h-5 w-5" />
                          <span className="text-[10px]">
                            {t("nav.dashboard_short")}
                          </span>
                        </div>
                        {navSlotsLocal.map((slot, i) => {
                          const Icon = NAV_SLOT_REGISTRY[slot].icon;
                          return (
                            <div
                              key={i}
                              className="flex flex-col items-center gap-0.5 py-2 text-primary"
                            >
                              <Icon className="h-5 w-5" />
                              <span className="text-[10px] font-medium">
                                {t(NAV_SLOT_REGISTRY[slot].labelKey)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div
                        className="gap-1.5 p-2 bg-muted/40"
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${navSlotsLocal.length + 1}, 1fr)`,
                        }}
                      >
                        <div className="flex items-center justify-center">
                          {navSlotsLocal.length < 4 &&
                            ALL_SLOT_KEYS.filter(
                              (k) => !navSlotsLocal.includes(k),
                            ).length > 0 && (
                              <button
                                type="button"
                                onClick={handleAddOrgSlot}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed text-muted-foreground transition-colors hover:bg-muted"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            )}
                        </div>
                        {navSlotsLocal.map((slot, i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-1"
                          >
                            <select
                              value={slot}
                              onChange={(e) =>
                                handleNavSlotChange(
                                  i,
                                  e.target.value as NavSlotKey,
                                )
                              }
                              className="h-7 w-auto min-w-[120px] max-w-full mx-auto block rounded-md border bg-background px-1 text-[10px] outline-none focus:ring-1 focus:ring-ring"
                            >
                              {ALL_SLOT_KEYS.filter(
                                (key) =>
                                  key === slot || !navSlotsLocal.includes(key),
                              ).map((key) => (
                                <option key={key} value={key}>
                                  {t(NAV_SLOT_REGISTRY[key].nameKey)}
                                </option>
                              ))}
                            </select>
                            {navSlotsLocal.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOrgSlot(i)}
                                className="text-[10px] text-muted-foreground hover:text-destructive"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Un seul bouton pour tout sauvegarder */}
                  <Button
                    type="submit"
                    className="w-full min-h-[44px]"
                    disabled={
                      updateOrg.isPending ||
                      !orgName.trim() ||
                      (orgName.trim() === org?.name &&
                        JSON.stringify(navSlotsLocal) ===
                          JSON.stringify(org?.navSlots ?? DEFAULT_NAV_SLOTS))
                    }
                  >
                    {updateOrg.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("settings.save")}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        )}

        {/* Navigation mobile (MEMBER uniquement) */}
        {role === "MEMBER" && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t("settings.nav_section")}</p>
            <Card className="p-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                {t("settings.nav_description")}
              </p>

              {accessibleSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("settings.nav_no_module")}
                </p>
              ) : (
                <>
                  {/* Mobile */}
                  <div className="lg:hidden space-y-3">
                    {userNav.map((slot, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute -top-2 left-3 z-10 bg-card px-1 text-[10px] text-muted-foreground leading-none">
                            {t("settings.nav_slot", { n: i + 1 })}
                          </span>
                          <select
                            value={slot}
                            onChange={(e) =>
                              handleUserSlotChange(i, e.target.value as NavSlotKey)
                            }
                            className="h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                          >
                            {accessibleSlots
                              .filter((key) => key === slot || !userNav.includes(key))
                              .map((key) => (
                                <option key={key} value={key}>
                                  {t(NAV_SLOT_REGISTRY[key].nameKey)}
                                </option>
                              ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(i)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={t("settings.nav_remove_slot")}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {userNav.length < 4 &&
                      accessibleSlots.filter((k) => !userNav.includes(k)).length > 0 && (
                        <button
                          type="button"
                          onClick={handleAddSlot}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                          {t("settings.nav_add_slot")}
                        </button>
                      )}
                  </div>

                  {/* Desktop : simulation de la barre de nav */}
                  <div className="hidden lg:block rounded-xl border overflow-hidden">
                    <div
                      className="bg-background border-b"
                      style={{ display: 'grid', gridTemplateColumns: `repeat(${userNav.length + 1}, 1fr)` }}
                    >
                      <div className="flex flex-col items-center gap-0.5 py-2 opacity-35">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-[10px]">{t("nav.dashboard_short")}</span>
                      </div>
                      {userNav.map((slot, i) => {
                        const Icon = NAV_SLOT_REGISTRY[slot].icon;
                        return (
                          <div key={i} className="flex flex-col items-center gap-0.5 py-2 text-primary">
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium">
                              {t(NAV_SLOT_REGISTRY[slot].labelKey)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      className="gap-1.5 p-2 bg-muted/40"
                      style={{ display: 'grid', gridTemplateColumns: `repeat(${userNav.length + 1}, 1fr)` }}
                    >
                      <div className="flex items-center justify-center">
                        {userNav.length < 4 &&
                          accessibleSlots.filter((k) => !userNav.includes(k)).length > 0 && (
                            <button
                              type="button"
                              onClick={handleAddSlot}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed text-muted-foreground transition-colors hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          )}
                      </div>
                      {userNav.map((slot, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <select
                            value={slot}
                            onChange={(e) => handleUserSlotChange(i, e.target.value as NavSlotKey)}
                            className="h-7 w-auto min-w-[120px] max-w-full mx-auto block rounded-md border bg-background px-1 text-[10px] outline-none focus:ring-1 focus:ring-ring"
                          >
                            {accessibleSlots
                              .filter((key) => key === slot || !userNav.includes(key))
                              .map((key) => (
                                <option key={key} value={key}>
                                  {t(NAV_SLOT_REGISTRY[key].nameKey)}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(i)}
                            className="text-[10px] text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 min-h-[44px]">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 min-h-[44px] gap-1.5"
                      onClick={() => setShowResetConfirm(true)}
                      disabled={navSaving}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {t("settings.nav_reset_btn")}
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 min-h-[44px]"
                      onClick={() => void handleSaveUserNav()}
                      disabled={
                        navSaving ||
                        JSON.stringify(userNav) ===
                          JSON.stringify(storeNavSlots)
                      }
                    >
                      {navSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("settings.save")
                      )}
                    </Button>
                  </div>

                  {showResetConfirm && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 space-y-2 dark:border-orange-900 dark:bg-orange-950/30">
                      <p className="text-sm font-medium">
                        {t("settings.nav_reset_title")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.nav_reset_body")}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowResetConfirm(false)}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1"
                          onClick={() => void handleResetUserNav()}
                          disabled={navSaving}
                        >
                          {t("settings.nav_reset_confirm")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Apparence : thème + couleur dans une seule card */}
      <div className="space-y-2">
        <p className="text-sm font-semibold">
          {t("settings.appearance_section")}
        </p>
        <Card className="divide-y">
          {/* Thème */}
          <div className="p-3">
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  {
                    value: "system",
                    labelKey: "settings.theme_system",
                    icon: Monitor,
                  },
                  {
                    value: "light",
                    labelKey: "settings.theme_light",
                    icon: Sun,
                  },
                  {
                    value: "dark",
                    labelKey: "settings.theme_dark",
                    icon: Moon,
                  },
                ] as const
              ).map(({ value, labelKey, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={[
                    "flex flex-col items-center gap-1.5 rounded-md px-2 py-3 text-xs font-medium transition-colors",
                    theme === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  ].join(" ")}
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
              {t("settings.handedness_section")}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  { value: "right", labelKey: "settings.handedness_right", flip: false },
                  { value: "left",  labelKey: "settings.handedness_left",  flip: true  },
                ] as { value: Handedness; labelKey: string; flip: boolean }[]
              ).map(({ value, labelKey, flip }) => (
                <button
                  key={value}
                  onClick={() => handleHandednessChange(value)}
                  className={[
                    "flex flex-col items-center gap-1.5 rounded-md px-2 py-3 text-xs font-medium transition-colors",
                    handedness === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  <Hand className={["h-4 w-4", flip ? "scale-x-[-1]" : ""].join(" ")} />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
          {/* Couleur */}
          <div className="p-3">
            <div className="grid grid-cols-4 gap-3">
              {(
                Object.entries(COLORS) as [
                  ColorKey,
                  (typeof COLORS)[ColorKey],
                ][]
              ).map(([key, { hex }]) => (
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
            {t("install.settings_btn")}
          </Button>
          <InstallModal
            open={installOpen}
            onClose={() => setInstallOpen(false)}
          />
        </>
      )}

      {isMobile && isInstalled && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          <Download className="h-3.5 w-3.5" />
          {t("install.installed_label")}
        </div>
      )}

    </div>
  );
}
