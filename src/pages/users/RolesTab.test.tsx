import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/use-roles'
import { RolesTab } from './RolesTab'
import type { Role } from '@/types/api'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/hooks/use-roles', () => ({
  useRoles: vi.fn(),
  useCreateRole: vi.fn(),
  useUpdateRole: vi.fn(),
  useDeleteRole: vi.fn(),
}))

// ── Fixtures ───────────────────────────────────────────────────────────────

const ROLE: Role = {
  id: 'role-1',
  name: 'Chef de chantier',
  organizationId: 'org-1',
  permissions: {
    chantiers: ['read', 'update'],
    clients: ['read'],
    equipe: [],
    prestations: [],
  },
  isDefault: false,
  _count: { users: 2 },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function mockMutation(overrides = {}) {
  return { mutateAsync: vi.fn(), isPending: false, ...overrides }
}

// ── Reset ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useRoles).mockReturnValue({ data: [], isLoading: false } as any)
  vi.mocked(useCreateRole).mockReturnValue(mockMutation() as never)
  vi.mocked(useUpdateRole).mockReturnValue(mockMutation() as never)
  vi.mocked(useDeleteRole).mockReturnValue(mockMutation() as never)
})

// ── Chargement ─────────────────────────────────────────────────────────────

describe('RolesTab — chargement', () => {
  it('affiche des skeletons pendant isLoading', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRoles).mockReturnValue({ data: undefined, isLoading: true } as any)
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(2)
  })
})

// ── État vide ──────────────────────────────────────────────────────────────

describe('RolesTab — état vide', () => {
  it('affiche le message "Aucun rôle configuré" quand la liste est vide', () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    expect(screen.getByText('Aucun rôle configuré')).toBeInTheDocument()
  })

  it('n\'affiche pas le message vide quand showCreate=true (formulaire visible)', () => {
    render(<RolesTab showCreate={true} onCloseCreate={vi.fn()} />)
    expect(screen.queryByText('Aucun rôle configuré')).not.toBeInTheDocument()
  })
})

// ── Liste des rôles ────────────────────────────────────────────────────────

describe('RolesTab — liste des rôles', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRoles).mockReturnValue({ data: [ROLE], isLoading: false } as any)
  })

  it('affiche le nom du rôle', () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    expect(screen.getByText('Chef de chantier')).toBeInTheDocument()
  })

  it('affiche le nombre d\'utilisateurs assignés', () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    expect(screen.getByText('2 membre(s)')).toBeInTheDocument()
  })

  it('n\'affiche pas la matrice de permissions par défaut (rôle replié)', () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    expect(screen.queryByText('Permissions')).not.toBeInTheDocument()
  })
})

// ── Expansion d'un rôle ────────────────────────────────────────────────────

describe('RolesTab — expansion du rôle', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRoles).mockReturnValue({ data: [ROLE], isLoading: false } as any)
  })

  it('cliquer sur le rôle ouvre le panneau d\'édition', async () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    await userEvent.click(screen.getByText('Chef de chantier'))
    expect(screen.getByText('Permissions')).toBeInTheDocument()
  })

  it('affiche le champ nom prérempli dans le panneau ouvert', async () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    await userEvent.click(screen.getByText('Chef de chantier'))
    // Le Label n'a pas de htmlFor — on cherche par la valeur du champ
    expect(screen.getByDisplayValue('Chef de chantier')).toBeInTheDocument()
  })

  it('affiche le bouton Enregistrer dans le panneau ouvert', async () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    await userEvent.click(screen.getByText('Chef de chantier'))
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument()
  })

  it('bouton Enregistrer désactivé quand aucune modification', async () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    await userEvent.click(screen.getByText('Chef de chantier'))
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled()
  })

  it('bouton Enregistrer activé après modification du nom', async () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    // Clic sur la ligne de rôle (pas sur l'input)
    const roleRow = screen.getByText('Chef de chantier').closest('button')!
    await userEvent.click(roleRow)
    const nameInput = screen.getByDisplayValue('Chef de chantier')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Nouveau nom')
    expect(screen.getByRole('button', { name: 'Enregistrer' })).not.toBeDisabled()
  })

  it('cliquer à nouveau replie le panneau', async () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    await userEvent.click(screen.getByText('Chef de chantier'))
    await userEvent.click(screen.getByText('Chef de chantier'))
    await waitFor(() => {
      expect(screen.queryByText('Permissions')).not.toBeInTheDocument()
    })
  })
})

// ── Matrice de permissions ─────────────────────────────────────────────────

describe('RolesTab — matrice de permissions', () => {
  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRoles).mockReturnValue({ data: [ROLE], isLoading: false } as any)
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    await userEvent.click(screen.getByText('Chef de chantier'))
  })

  it('affiche les 4 modules', () => {
    expect(screen.getByText('Chantiers')).toBeInTheDocument()
    expect(screen.getByText('Clients')).toBeInTheDocument()
    expect(screen.getByText('Équipe')).toBeInTheDocument()
    expect(screen.getByText('Prestations')).toBeInTheDocument()
  })

  it('affiche les 4 actions en colonnes', () => {
    expect(screen.getByText('Voir')).toBeInTheDocument()
    expect(screen.getByText('Créer')).toBeInTheDocument()
    expect(screen.getByText('Modifier')).toBeInTheDocument()
    expect(screen.getByText('Supprimer')).toBeInTheDocument()
  })

  it('les cases cochées correspondent aux permissions du rôle', () => {
    const checkboxes = screen.getAllByRole('checkbox')
    // chantiers.read et chantiers.update cochés, clients.read coché
    const checked = checkboxes.filter((cb) => (cb as HTMLInputElement).checked)
    expect(checked.length).toBe(3) // chantiers: read+update, clients: read
  })
})

// ── Formulaire de création ─────────────────────────────────────────────────

describe('RolesTab — formulaire de création', () => {
  it('affiche le formulaire quand showCreate=true', () => {
    render(<RolesTab showCreate={true} onCloseCreate={vi.fn()} />)
    expect(screen.getByText('Nouveau rôle')).toBeInTheDocument()
  })

  it('n\'affiche pas le formulaire quand showCreate=false', () => {
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    expect(screen.queryByText('Nouveau rôle')).not.toBeInTheDocument()
  })

  it('le bouton Enregistrer est désactivé si le nom est vide', () => {
    render(<RolesTab showCreate={true} onCloseCreate={vi.fn()} />)
    const submitBtn = screen.getByRole('button', { name: 'Enregistrer' })
    expect(submitBtn).toBeDisabled()
  })

  it('le bouton Enregistrer est activé après saisie d\'un nom', async () => {
    render(<RolesTab showCreate={true} onCloseCreate={vi.fn()} />)
    await userEvent.type(
      screen.getByPlaceholderText('Ex : Chef de chantier'),
      'Mon rôle',
    )
    expect(screen.getByRole('button', { name: 'Enregistrer' })).not.toBeDisabled()
  })

  it('cliquer Annuler appelle onCloseCreate', async () => {
    const onClose = vi.fn()
    render(<RolesTab showCreate={true} onCloseCreate={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('soumettre le formulaire appelle createRole.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({})
    vi.mocked(useCreateRole).mockReturnValue({ mutateAsync, isPending: false } as never)
    const onClose = vi.fn()
    render(<RolesTab showCreate={true} onCloseCreate={onClose} />)
    await userEvent.type(
      screen.getByPlaceholderText('Ex : Chef de chantier'),
      'Mon rôle',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mon rôle' }),
      )
    })
  })
})

// ── Bouton supprimer ───────────────────────────────────────────────────────

describe('RolesTab — suppression', () => {
  it('bouton supprimer désactivé quand le rôle a des utilisateurs assignés', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRoles).mockReturnValue({ data: [ROLE], isLoading: false } as any)
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    await userEvent.click(screen.getByText('Chef de chantier'))
    // Find the destructive delete button
    const allButtons = screen.getAllByRole('button')
    const deleteButton = allButtons.find((b) =>
      b.className.includes('destructive'),
    )
    expect(deleteButton).toBeDisabled()
  })

  it('bouton supprimer activé quand le rôle n\'a pas d\'utilisateurs', async () => {
    const roleNoUsers: Role = { ...ROLE, _count: { users: 0 } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRoles).mockReturnValue({ data: [roleNoUsers], isLoading: false } as any)
    render(<RolesTab showCreate={false} onCloseCreate={vi.fn()} />)
    await userEvent.click(screen.getByText('Chef de chantier'))
    const allButtons = screen.getAllByRole('button')
    const deleteButton = allButtons.find((b) =>
      b.className.includes('destructive'),
    )
    expect(deleteButton).not.toBeDisabled()
  })
})
