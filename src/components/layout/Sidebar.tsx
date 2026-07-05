import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  HardHat,
  Users,
  UserCog,
  Leaf,
  Settings,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useOrganization } from "@/hooks/use-organization";
import { usePermissions } from "@/hooks/use-permissions";

interface NavItem {
  to: string;
  icon: React.ElementType;
  labelKey: string;
  end?: boolean;
  permModule?: string;
  permAction?: string;
}

const ADMIN_NAV: NavItem[] = [
  { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard", end: true },
  { to: "/chantiers", icon: HardHat, labelKey: "nav.projects" },
  { to: "/clients", icon: Users, labelKey: "nav.clients" },
  { to: "/utilisateurs", icon: UserCog, labelKey: "nav.team" },
  { to: "/prestations", icon: BookOpen, labelKey: "nav.services" },
  { to: "/parametres", icon: Settings, labelKey: "nav.settings" },
];

const MEMBER_NAV: NavItem[] = [
  { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard", end: true },
  { to: "/chantiers", icon: HardHat, labelKey: "nav.projects", permModule: "chantiers", permAction: "read" },
  { to: "/clients", icon: Users, labelKey: "nav.clients", permModule: "clients", permAction: "read" },
  { to: "/utilisateurs", icon: UserCog, labelKey: "nav.team", permModule: "equipe", permAction: "read" },
  { to: "/prestations", icon: BookOpen, labelKey: "nav.services", permModule: "prestations", permAction: "read" },
  { to: "/parametres", icon: Settings, labelKey: "nav.settings" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const role = useAuthStore((s) => s.role);
  const { t } = useTranslation();
  const { can } = usePermissions();
  const { data: org } = useOrganization();

  const rawItems = role === "ADMIN" ? ADMIN_NAV : MEMBER_NAV;
  const items = rawItems.filter((item) =>
    item.permModule && item.permAction
      ? can(item.permModule as never, item.permAction as never)
      : true,
  );

  return (
    <aside className={cn("w-60 flex-col border-r bg-card", className)}>
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Leaf className="h-5 w-5 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="font-bold tracking-tight text-foreground leading-tight">
            Landscape
          </p>
          {org && (
            <p className="text-xs text-muted-foreground leading-tight truncate">
              {org.name}
            </p>
          )}
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map(({ to, icon: Icon, labelKey, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
