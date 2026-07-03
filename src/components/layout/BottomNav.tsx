import { NavLink } from "react-router-dom";
import { LayoutDashboard, HardHat, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useOrganization } from "@/hooks/use-organization";
import {
  NAV_SLOT_REGISTRY,
  DEFAULT_NAV_SLOTS,
  type NavSlotKey,
} from "@/lib/nav-slots";
import type { UserRole } from "@/types/api";

interface NavItem {
  to: string;
  icon: React.ElementType;
  labelKey: string;
  end?: boolean;
}

const FIXED_START: NavItem = {
  to: "/",
  icon: LayoutDashboard,
  labelKey: "nav.dashboard_short",
  end: true,
};
const FIXED_END: NavItem = {
  to: "/parametres",
  icon: Settings,
  labelKey: "nav.settings",
};

const STATIC_NAV: Record<Exclude<UserRole, "ADMIN">, NavItem[]> = {
  FOREMAN: [
    FIXED_START,
    { to: "/chantiers", icon: HardHat, labelKey: "nav.projects" },
    FIXED_END,
  ],
  EMPLOYEE: [
    FIXED_START,
    { to: "/chantiers", icon: HardHat, labelKey: "nav.projects" },
    FIXED_END,
  ],
};

function AdminBottomNav({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { data: org } = useOrganization();

  const slots = (org?.navSlots ?? DEFAULT_NAV_SLOTS) as NavSlotKey[];
  const middleItems: NavItem[] = slots
    .map((key) => NAV_SLOT_REGISTRY[key])
    .filter(Boolean)
    .map(({ to, icon, labelKey }) => ({ to, icon, labelKey }));

  const items: NavItem[] = [FIXED_START, ...middleItems, FIXED_END];

  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 flex border-t bg-card safe-area-bottom", className)}>
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

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const role = useAuthStore((s) => s.role);
  const { t } = useTranslation();

  if (role === "ADMIN") {
    return <AdminBottomNav className={className} />;
  }

  const items = role ? STATIC_NAV[role] : [];

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
