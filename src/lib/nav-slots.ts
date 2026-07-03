import { HardHat, Users, UserCog, BookOpen } from 'lucide-react'

export type NavSlotKey = 'chantiers' | 'clients' | 'utilisateurs' | 'prestations'

export const DEFAULT_NAV_SLOTS: NavSlotKey[] = ['chantiers', 'clients', 'prestations']

export const NAV_SLOT_REGISTRY: Record<NavSlotKey, {
  to: string
  icon: React.ElementType
  labelKey: string
  nameKey: string
}> = {
  chantiers:    { to: '/chantiers',    icon: HardHat,  labelKey: 'nav.projects',      nameKey: 'nav.projects' },
  clients:      { to: '/clients',      icon: Users,    labelKey: 'nav.clients',       nameKey: 'nav.clients' },
  utilisateurs: { to: '/utilisateurs', icon: UserCog,  labelKey: 'nav.team',          nameKey: 'nav.team' },
  prestations:  { to: '/prestations',  icon: BookOpen, labelKey: 'nav.services_short', nameKey: 'nav.services' },
}

export const ALL_SLOT_KEYS = Object.keys(NAV_SLOT_REGISTRY) as NavSlotKey[]
