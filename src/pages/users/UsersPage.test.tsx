import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/use-users'
import { useRoles } from '@/hooks/use-roles'
import { UsersPage } from './UsersPage'
import type { User } from '@/types/api'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/hooks/use-users', () => ({
  useUsers: vi.fn(),
  useCreateUser: vi.fn(),
  useUpdateUser: vi.fn(),
}))

vi.mock('@/hooks/use-roles', () => ({
  useRoles: vi.fn(),
  useCreateRole: vi.fn(),
  useUpdateRole: vi.fn(),
  useDeleteRole: vi.fn(),
}))

// ── Fixtures ───────────────────────────────────────────────────────────────

const USER_ACTIVE: User = {
  id: 'u1',
  username: 'jean.dupont',
  email: 'jean@test.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  role: 'FOREMAN',
  customRoleId: null,
  active: true,
  navSlots: [],
  language: 'fr',
  theme: 'light',
  accentColor: '#000',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const USER_INACTIVE: User = {
  ...USER_ACTIVE,
  id: 'u2',
  username: 'marie.martin',
  firstName: 'Marie',
  lastName: 'Martin',
  active: false,
}

function mockMutation(overrides = {}) {
  return { mutateAsync: vi.fn(), isPending: false, ...overrides }
}

// ── Reset ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useUsers).mockReturnValue({ data: [], isLoading: false } as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useRoles).mockReturnValue({ data: [], isLoading: false } as any)
  vi.mocked(useCreateUser).mockReturnValue(mockMutation() as never)
  vi.mocked(useUpdateUser).mockReturnValue(mockMutation() as never)
})

// ── Rendu de base ──────────────────────────────────────────────────────────

describe('UsersPage — rendu', () => {
  it('affiche le titre Utilisateurs', () => {
    render(<UsersPage />)
    expect(screen.getByRole('heading', { name: 'Utilisateurs' })).toBeInTheDocument()
  })

  it('affiche le bouton Nouveau', () => {
    render(<UsersPage />)
    expect(screen.getByRole('button', { name: /nouveau/i })).toBeInTheDocument()
  })

  it('affiche les onglets Membres et Rôles', () => {
    render(<UsersPage />)
    expect(screen.getByRole('button', { name: 'Membres' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rôles' })).toBeInTheDocument()
  })

  it('l\'onglet Membres est actif par défaut', () => {
    render(<UsersPage />)
    // The active tab has bg-background class
    const membresTab = screen.getByRole('button', { name: 'Membres' })
    expect(membresTab.className).toContain('bg-background')
  })
})

// ── Onglets ────────────────────────────────────────────────────────────────

describe('UsersPage — navigation par onglets', () => {
  it('cliquer sur "Rôles" affiche le contenu des rôles', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Rôles' }))
    // RolesTab renders "Aucun rôle configuré" when empty
    await waitFor(() => {
      expect(screen.getByText('Aucun rôle configuré')).toBeInTheDocument()
    })
  })

  it('cliquer sur "Membres" après "Rôles" revient à la liste des membres', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Rôles' }))
    await userEvent.click(screen.getByRole('button', { name: 'Membres' }))
    // State vide → EmptyState "Aucun utilisateur"
    await waitFor(() => {
      expect(screen.getByText('Aucun utilisateur')).toBeInTheDocument()
    })
  })

  it('changer d\'onglet ferme le formulaire de création', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByRole('button', { name: /nouveau/i }))
    expect(screen.getByText('Nouvel utilisateur')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Rôles' }))
    expect(screen.queryByText('Nouvel utilisateur')).not.toBeInTheDocument()
  })
})

// ── Formulaire de création ─────────────────────────────────────────────────

describe('UsersPage — formulaire Nouvel utilisateur', () => {
  it('cliquer Nouveau affiche le formulaire', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByRole('button', { name: /nouveau/i }))
    expect(screen.getByText('Nouvel utilisateur')).toBeInTheDocument()
  })

  it('cliquer Nouveau une deuxième fois masque le formulaire (toggle)', async () => {
    render(<UsersPage />)
    // Premier clic : affiche le formulaire
    const toggleBtn = screen.getByRole('button', { name: 'Nouveau' })
    await userEvent.click(toggleBtn)
    expect(screen.getByText('Nouvel utilisateur')).toBeInTheDocument()
    // Deuxième clic sur le premier bouton "Nouveau" (toggle header)
    const allNewButtons = screen.getAllByRole('button', { name: 'Nouveau' })
    await userEvent.click(allNewButtons[0]) // header toggle
    await waitFor(() => {
      expect(screen.queryByText('Nouvel utilisateur')).not.toBeInTheDocument()
    })
  })

  it('cliquer Annuler masque le formulaire', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByRole('button', { name: /nouveau/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    await waitFor(() => {
      expect(screen.queryByText('Nouvel utilisateur')).not.toBeInTheDocument()
    })
  })
})

// ── Liste des membres actifs ────────────────────────────────────────────────

describe('UsersPage — liste des membres', () => {
  it('affiche le nom complet de l\'utilisateur actif', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUsers).mockReturnValue({ data: [USER_ACTIVE], isLoading: false } as any)
    render(<UsersPage />)
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
  })

  it('affiche le username', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUsers).mockReturnValue({ data: [USER_ACTIVE], isLoading: false } as any)
    render(<UsersPage />)
    expect(screen.getByText(/@jean\.dupont/)).toBeInTheDocument()
  })

  it('affiche la section "Comptes inactifs" pour les utilisateurs inactifs', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUsers).mockReturnValue({
      data: [USER_ACTIVE, USER_INACTIVE],
      isLoading: false,
    } as any)
    render(<UsersPage />)
    expect(screen.getByText('Comptes inactifs')).toBeInTheDocument()
    expect(screen.getByText('Marie Martin')).toBeInTheDocument()
  })

  it('affiche 3 skeletons pendant le chargement', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUsers).mockReturnValue({ data: undefined, isLoading: true } as any)
    render(<UsersPage />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(3)
  })

  it('affiche l\'état vide quand aucun utilisateur', () => {
    render(<UsersPage />)
    expect(screen.getByText('Aucun utilisateur')).toBeInTheDocument()
  })
})

// ── Expansion d'un utilisateur ─────────────────────────────────────────────

describe('UsersPage — expansion d\'un utilisateur', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUsers).mockReturnValue({ data: [USER_ACTIVE], isLoading: false } as any)
  })

  it('cliquer sur un utilisateur ouvre le formulaire d\'édition', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByText('Jean Dupont'))
    expect(screen.getByDisplayValue('Jean')).toBeInTheDocument()         // prénom
    expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument()       // nom
    expect(screen.getByDisplayValue('jean.dupont')).toBeInTheDocument()  // username
  })

  it('le formulaire d\'édition contient le champ identifiant pré-rempli', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByText('Jean Dupont'))
    expect(screen.getByDisplayValue('jean.dupont')).toBeInTheDocument()
  })

  it('enregistrer inclut le username dans la mutation', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({})
    vi.mocked(useUpdateUser).mockReturnValue({ mutateAsync, isPending: false } as never)
    render(<UsersPage />)
    await userEvent.click(screen.getByText('Jean Dupont'))
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'jean.dupont' }),
    )
  })

  it('affiche le bouton Enregistrer dans le panneau ouvert', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByText('Jean Dupont'))
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument()
  })

  it('affiche le bouton désactiver pour un utilisateur actif', async () => {
    render(<UsersPage />)
    await userEvent.click(screen.getByText('Jean Dupont'))
    expect(screen.getByRole('button', { name: 'Désactiver le compte' })).toBeInTheDocument()
  })
})
