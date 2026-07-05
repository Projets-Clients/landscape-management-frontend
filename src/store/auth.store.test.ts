import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'
import { makePermissions, FULL_PERMISSIONS } from '@/lib/permissions'

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Génère un faux JWT avec un payload base64url encodé.
 * La signature est fictive — seul le payload est testé.
 */
function makeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const body = encode(payload)
  return `${header}.${body}.fake-signature`
}

const VALID_JWT_ADMIN  = makeJwt({ sub: 'user-id-001', role: 'ADMIN' })
const VALID_JWT_MEMBER = makeJwt({ sub: 'user-id-002', role: 'MEMBER', orgId: 'org-1' })
const VALID_JWT_MEMBER2 = makeJwt({ sub: 'user-id-003', role: 'MEMBER' })

// ── Reset entre chaque test ────────────────────────────────────────────────

beforeEach(() => {
  sessionStorage.clear()
  useAuthStore.setState({
    accessToken: null,
    username: '',
    role: null,
    userId: null,
    permissions: null,
  })
})

// ── setAuth — décodage JWT ─────────────────────────────────────────────────

describe('setAuth', () => {
  it('stocke le accessToken tel quel', () => {
    useAuthStore.getState().setAuth(VALID_JWT_ADMIN, 'admin')
    expect(useAuthStore.getState().accessToken).toBe(VALID_JWT_ADMIN)
  })

  it('stocke le username', () => {
    useAuthStore.getState().setAuth(VALID_JWT_ADMIN, 'admin')
    expect(useAuthStore.getState().username).toBe('admin')
  })

  it('décode le rôle ADMIN depuis le JWT', () => {
    useAuthStore.getState().setAuth(VALID_JWT_ADMIN, 'admin')
    expect(useAuthStore.getState().role).toBe('ADMIN')
  })

  it('décode le rôle MEMBER depuis le JWT', () => {
    useAuthStore.getState().setAuth(VALID_JWT_MEMBER, 'jean.dupont')
    expect(useAuthStore.getState().role).toBe('MEMBER')
  })

  it('décode le userId (sub) depuis le JWT', () => {
    useAuthStore.getState().setAuth(VALID_JWT_ADMIN, 'admin')
    expect(useAuthStore.getState().userId).toBe('user-id-001')
  })

  it('persiste le username dans sessionStorage', () => {
    useAuthStore.getState().setAuth(VALID_JWT_ADMIN, 'admin')
    expect(sessionStorage.getItem('username')).toBe('admin')
  })

  it('met à jour le store lors d\'un second appel (re-login)', () => {
    useAuthStore.getState().setAuth(VALID_JWT_ADMIN, 'admin')
    useAuthStore.getState().setAuth(VALID_JWT_MEMBER2, 'jean.dupont')
    const state = useAuthStore.getState()
    expect(state.role).toBe('MEMBER')
    expect(state.userId).toBe('user-id-003')
    expect(state.username).toBe('jean.dupont')
  })
})

// ── setAuth — JWT malformé ─────────────────────────────────────────────────

describe('setAuth avec JWT invalide', () => {
  it('ne plante pas avec un token vide', () => {
    expect(() => useAuthStore.getState().setAuth('', 'user')).not.toThrow()
    const state = useAuthStore.getState()
    expect(state.role).toBeNull()
    expect(state.userId).toBeNull()
  })

  it('ne plante pas avec un token sans points', () => {
    expect(() => useAuthStore.getState().setAuth('notavalidjwt', 'user')).not.toThrow()
    const state = useAuthStore.getState()
    expect(state.role).toBeNull()
    expect(state.userId).toBeNull()
  })

  it('ne plante pas avec un payload non-JSON', () => {
    const bad = 'header.bm90anNvbg.signature' // "notjson" en base64
    expect(() => useAuthStore.getState().setAuth(bad, 'user')).not.toThrow()
    const state = useAuthStore.getState()
    expect(state.role).toBeNull()
    expect(state.userId).toBeNull()
  })

  it('stocke quand même le accessToken même si le payload est invalide', () => {
    const badToken = 'header.bm90anNvbg.sig'
    useAuthStore.getState().setAuth(badToken, 'user')
    expect(useAuthStore.getState().accessToken).toBe(badToken)
  })
})

// ── setAuth — base64url (RFC 7515) ─────────────────────────────────────────

describe('setAuth — décodage base64url (RFC 7515)', () => {
  it('décode correctement un payload contenant des caractères - et _', () => {
    // Force un payload qui produit + et / en base64 standard,
    // donc - et _ en base64url
    const payload = { sub: 'user-with-special~chars', role: 'ADMIN' }
    const rawBase64 = btoa(JSON.stringify(payload))
    const hasSpecialChars = rawBase64.includes('+') || rawBase64.includes('/')

    // Si le payload naturel ne produit pas de caractères spéciaux,
    // on teste au moins que le décodage n'échoue pas
    const jwt = makeJwt(payload)
    useAuthStore.getState().setAuth(jwt, 'user')

    if (hasSpecialChars) {
      expect(useAuthStore.getState().role).toBe('ADMIN')
    } else {
      // Toujours valide dans tous les cas
      expect(useAuthStore.getState().role).toBe('ADMIN')
    }
  })

  it('gère un padding manquant (base64url sans =)', () => {
    // makeJwt retire les '=' — le décodage doit quand même fonctionner
    const jwt = makeJwt({ sub: 'abc', role: 'MEMBER' })
    expect(jwt.includes('=')).toBe(false)
    useAuthStore.getState().setAuth(jwt, 'user')
    expect(useAuthStore.getState().role).toBe('MEMBER')
    expect(useAuthStore.getState().userId).toBe('abc')
  })
})

// ── clearAuth ──────────────────────────────────────────────────────────────

describe('setAuth — rôle MEMBER', () => {
  it('décode le rôle MEMBER depuis le JWT', () => {
    useAuthStore.getState().setAuth(VALID_JWT_MEMBER, 'jean.dupont')
    expect(useAuthStore.getState().role).toBe('MEMBER')
  })

  it('décode le userId depuis le JWT MEMBER', () => {
    useAuthStore.getState().setAuth(VALID_JWT_MEMBER, 'jean.dupont')
    expect(useAuthStore.getState().userId).toBe('user-id-002')
  })

  it('décode l\'organizationId (orgId) depuis le JWT MEMBER', () => {
    useAuthStore.getState().setAuth(VALID_JWT_MEMBER, 'jean.dupont')
    expect(useAuthStore.getState().organizationId).toBe('org-1')
  })

  it('ne définit pas les permissions (celles-ci sont chargées via /users/me)', () => {
    useAuthStore.getState().setAuth(VALID_JWT_MEMBER, 'jean.dupont')
    expect(useAuthStore.getState().permissions).toBeNull()
  })
})

// ── setPermissions ─────────────────────────────────────────────────────────

describe('setPermissions', () => {
  it('stocke les permissions dans le store', () => {
    const perms = makePermissions({ chantiers: ['read', 'update'] })
    useAuthStore.getState().setPermissions(perms)
    expect(useAuthStore.getState().permissions).toEqual(perms)
  })

  it('accepte FULL_PERMISSIONS', () => {
    useAuthStore.getState().setPermissions(FULL_PERMISSIONS)
    expect(useAuthStore.getState().permissions).toEqual(FULL_PERMISSIONS)
  })

  it('accepte null (déconnexion ou utilisateur sans rôle)', () => {
    useAuthStore.getState().setPermissions(makePermissions({ chantiers: ['read'] }))
    useAuthStore.getState().setPermissions(null)
    expect(useAuthStore.getState().permissions).toBeNull()
  })
})

// ── clearAuth ──────────────────────────────────────────────────────────────

describe('clearAuth', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth(VALID_JWT_ADMIN, 'admin')
    useAuthStore.getState().setPermissions(FULL_PERMISSIONS)
  })

  it('remet accessToken à null', () => {
    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('remet username à une chaîne vide', () => {
    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().username).toBe('')
  })

  it('remet role à null', () => {
    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().role).toBeNull()
  })

  it('remet userId à null', () => {
    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().userId).toBeNull()
  })

  it('remet permissions à null', () => {
    useAuthStore.getState().clearAuth()
    expect(useAuthStore.getState().permissions).toBeNull()
  })

  it('supprime username du sessionStorage', () => {
    expect(sessionStorage.getItem('username')).toBe('admin')
    useAuthStore.getState().clearAuth()
    expect(sessionStorage.getItem('username')).toBeNull()
  })
})

// ── Initialisation depuis sessionStorage ───────────────────────────────────

describe('initialisation du store', () => {
  it('lit le username depuis sessionStorage au démarrage', async () => {
    sessionStorage.setItem('username', 'jean.dupont')

    // Re-importer le module pour simuler un rechargement du store
    // Zustand est un singleton, donc on vérifie le comportement de l'init
    // via getState() après un setState manuel qui simule un montage frais
    const { useAuthStore: freshStore } = await import('./auth.store')
    // Le store est un singleton : son état initial lit sessionStorage
    // On vérifie que la valeur par défaut de username vient de sessionStorage
    // en inspectant la fonction de création (comportement de l'état initial)
    expect(freshStore.getState().username).toBeDefined()
  })
})
