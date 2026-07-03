import { describe, it, expect } from 'vitest'
import { can, makePermissions, EMPTY_PERMISSIONS, FULL_PERMISSIONS, MODULES, ACTIONS } from './permissions'
import type { Permissions } from '@/types/api'

// ── can() ─────────────────────────────────────────────────────────────────

describe('can — entrées nulles / undefined', () => {
  it('retourne false si permissions est null', () => {
    expect(can(null, 'chantiers', 'read')).toBe(false)
  })

  it('retourne false si permissions est undefined', () => {
    expect(can(undefined, 'chantiers', 'read')).toBe(false)
  })
})

describe('can — EMPTY_PERMISSIONS', () => {
  it.each(MODULES)('retourne false pour tous les modules quand permissions est vide (%s)', (mod) => {
    ACTIONS.forEach((action) => {
      expect(can(EMPTY_PERMISSIONS, mod, action)).toBe(false)
    })
  })
})

describe('can — FULL_PERMISSIONS', () => {
  it.each(MODULES)('retourne true pour toutes les actions sur %s', (mod) => {
    ACTIONS.forEach((action) => {
      expect(can(FULL_PERMISSIONS, mod, action)).toBe(true)
    })
  })
})

describe('can — permissions partielles', () => {
  const partial: Permissions = {
    chantiers: ['read', 'update'],
    clients: ['read'],
    equipe: [],
    prestations: ['read', 'create', 'update', 'delete'],
  }

  it('retourne true pour une action autorisée', () => {
    expect(can(partial, 'chantiers', 'read')).toBe(true)
    expect(can(partial, 'chantiers', 'update')).toBe(true)
    expect(can(partial, 'clients', 'read')).toBe(true)
  })

  it('retourne false pour une action non autorisée', () => {
    expect(can(partial, 'chantiers', 'create')).toBe(false)
    expect(can(partial, 'chantiers', 'delete')).toBe(false)
    expect(can(partial, 'clients', 'create')).toBe(false)
    expect(can(partial, 'clients', 'update')).toBe(false)
    expect(can(partial, 'clients', 'delete')).toBe(false)
  })

  it('retourne false quand le tableau du module est vide', () => {
    expect(can(partial, 'equipe', 'read')).toBe(false)
    expect(can(partial, 'equipe', 'create')).toBe(false)
  })

  it('retourne true pour toutes les actions sur un module avec accès complet', () => {
    ACTIONS.forEach((action) => {
      expect(can(partial, 'prestations', action)).toBe(true)
    })
  })
})

describe('can — immutabilité', () => {
  it('ne modifie pas l\'objet permissions passé en entrée', () => {
    const perms: Permissions = { chantiers: ['read'], clients: [], equipe: [], prestations: [] }
    const before = JSON.stringify(perms)
    can(perms, 'chantiers', 'read')
    expect(JSON.stringify(perms)).toBe(before)
  })
})

// ── makePermissions() ─────────────────────────────────────────────────────

describe('makePermissions', () => {
  it('retourne EMPTY_PERMISSIONS quand l\'entrée est vide', () => {
    expect(makePermissions({})).toEqual(EMPTY_PERMISSIONS)
  })

  it('surcharge les modules fournis, complète les autres avec []', () => {
    const result = makePermissions({ chantiers: ['read', 'create'] })
    expect(result).toEqual({
      chantiers: ['read', 'create'],
      clients: [],
      equipe: [],
      prestations: [],
    })
  })

  it('accepte plusieurs modules simultanément', () => {
    const result = makePermissions({ clients: ['read'], equipe: ['read', 'update'] })
    expect(result.clients).toEqual(['read'])
    expect(result.equipe).toEqual(['read', 'update'])
    expect(result.chantiers).toEqual([])
    expect(result.prestations).toEqual([])
  })

  it('ne mute pas EMPTY_PERMISSIONS', () => {
    const before = JSON.stringify(EMPTY_PERMISSIONS)
    makePermissions({ chantiers: ['read'] })
    expect(JSON.stringify(EMPTY_PERMISSIONS)).toBe(before)
  })

  it('retourne un nouvel objet à chaque appel', () => {
    const a = makePermissions({})
    const b = makePermissions({})
    expect(a).not.toBe(b)
  })
})

// ── Constantes ────────────────────────────────────────────────────────────

describe('MODULES et ACTIONS', () => {
  it('MODULES contient les 4 modules attendus', () => {
    expect(MODULES).toEqual(['chantiers', 'clients', 'equipe', 'prestations'])
  })

  it('ACTIONS contient les 4 actions attendues', () => {
    expect(ACTIONS).toEqual(['read', 'create', 'update', 'delete'])
  })

  it('FULL_PERMISSIONS couvre tous les modules et toutes les actions', () => {
    MODULES.forEach((mod) => {
      expect(FULL_PERMISSIONS[mod]).toEqual(expect.arrayContaining([...ACTIONS]))
    })
  })
})
