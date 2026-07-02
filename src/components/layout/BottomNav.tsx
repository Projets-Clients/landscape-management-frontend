import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  HardHat,
  Users,
  Settings,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/api";

interface NavItem {
  to: string;
  icon: React.ElementType;
  labelKey: string;
  end?: boolean;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard_short", end: true },
    { to: "/chantiers", icon: HardHat, labelKey: "nav.projects" },
    { to: "/clients", icon: Users, labelKey: "nav.clients" },
    { to: "/prestations", icon: BookOpen, labelKey: "nav.services_short" },
    { to: "/parametres", icon: Settings, labelKey: "nav.settings" },
  ],
  FOREMAN: [
    { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard_short", end: true },
    { to: "/chantiers", icon: HardHat, labelKey: "nav.projects" },
    { to: "/parametres", icon: Settings, labelKey: "nav.settings" },
  ],
  EMPLOYEE: [
    { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard_short", end: true },
    { to: "/chantiers", icon: HardHat, labelKey: "nav.projects" },
    { to: "/parametres", icon: Settings, labelKey: "nav.settings" },
  ],
};

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const role = useAuthStore((s) => s.role);
  const { t } = useTranslation();
  const items = role ? NAV_BY_ROLE[role] : [];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 flex border-t bg-card safe-area-bottom",
        className,
      )}
    >
      {items.map(({ to, icon: Icon, labelKey, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors min-h-[56px] justify-center",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span className="leading-none">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
