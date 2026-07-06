import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useProjects } from '@/hooks/use-projects'
import { useAuthStore } from '@/store/auth.store'
import { makePermissions, EMPTY_PERMISSIONS, FULL_PERMISSIONS } from '@/lib/permissions'
import { DashboardPage } from './DashboardPage'
import type { Paginated, Project } from '@/types/api'

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('@/hooks/use-projects', () => ({
  useProjects: vi.fn(),
}))

// ── Helpers ────────────────────────────────────────────────────────────────

function emptyPaginated(): Paginated<Project> {
  return { data: [], total: 0, page: 1, limit: 1 }
}

function mockQueryResult() {
  return { data: emptyPaginated(), isLoading: false }
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

// ── Reset ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useProjects).mockReturnValue(mockQueryResult() as any)
  useAuthStore.setState({
    accessToken: 'tok',
    username: 'admin',
    firstName: 'Admin',
    lastName: '',
    role: 'ADMIN',
    userId: 'u1',
    permissions: null,
  })
})

// ── Rendu de base ──────────────────────────────────────────────────────────

describe('DashboardPage — rendu', () => {
  it('affiche la salutation avec le prénom', () => {
    renderDashboard()
    expect(screen.getByText('Bonjour, Admin')).toBeInTheDocument()
  })

  it('affiche la section Modules', () => {
    renderDashboard()
    expect(screen.getByText('Modules')).toBeInTheDocument()
  })

  it('affiche le lien "Voir tout"', () => {
    renderDashboard()
    expect(screen.getByText('Voir tout')).toBeInTheDocument()
  })
})

// ── Tuiles modules — ADMIN ─────────────────────────────────────────────────

describe('DashboardPage — tuiles ADMIN', () => {
  it('affiche les 4 tuiles pour un ADMIN', () => {
    useAuthStore.setState({ role: 'ADMIN', permissions: null, accessToken: 'tok', username: 'admin', firstName: 'Admin', lastName: '', userId: 'u1' })
    renderDashboard()
    expect(screen.getByRole('button', { name: /chantiers/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clients/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /équipe/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /prestations/i })).toBeInTheDocument()
  })
})

// ── Tuiles modules — MEMBER sans permissions ───────────────────────────────

describe('DashboardPage — MEMBER sans permissions', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'tok',
      username: 'user',
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'MEMBER',
      userId: 'u2',
      permissions: EMPTY_PERMISSIONS,
    })
  })

  it('n\'affiche aucune tuile module', () => {
    renderDashboard()
    // Section "Modules" masquée si visibleModules.length === 0
    expect(screen.queryByText('Chantiers')).not.toBeInTheDocument()
    expect(screen.queryByText('Clients')).not.toBeInTheDocument()
    expect(screen.queryByText('Équipe')).not.toBeInTheDocument()
    expect(screen.queryByText('Prestations')).not.toBeInTheDocument()
  })
})

// ── Tuiles modules — MEMBER avec permissions partielles ────────────────────

describe('DashboardPage — MEMBER permissions partielles', () => {
  it('affiche uniquement la tuile chantiers quand seul chantiers.read est accordé', () => {
    useAuthStore.setState({
      accessToken: 'tok',
      username: 'user',
      firstName: 'Marie',
      lastName: '',
      role: 'MEMBER',
      userId: 'u2',
      permissions: makePermissions({ chantiers: ['read'] }),
    })
    renderDashboard()
    expect(screen.getByRole('button', { name: /chantiers/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clients/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /équipe/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /prestations/i })).not.toBeInTheDocument()
  })

  it('affiche 2 tuiles quand chantiers + clients read sont accordés', () => {
    useAuthStore.setState({
      accessToken: 'tok',
      username: 'user',
      firstName: 'Marie',
      lastName: '',
      role: 'MEMBER',
      userId: 'u2',
      permissions: makePermissions({ chantiers: ['read'], clients: ['read'] }),
    })
    renderDashboard()
    expect(screen.getByRole('button', { name: /chantiers/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clients/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /équipe/i })).not.toBeInTheDocument()
  })

  it('affiche les 4 tuiles avec FULL_PERMISSIONS', () => {
    useAuthStore.setState({
      accessToken: 'tok',
      username: 'user',
      firstName: 'Marie',
      lastName: '',
      role: 'MEMBER',
      userId: 'u2',
      permissions: FULL_PERMISSIONS,
    })
    renderDashboard()
    expect(screen.getByRole('button', { name: /chantiers/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clients/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /équipe/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /prestations/i })).toBeInTheDocument()
  })
})

// ── Chargement des projets récents ─────────────────────────────────────────

describe('DashboardPage — projets récents', () => {
  it('affiche 3 skeletons pendant le chargement des projets récents', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useProjects).mockReturnValue({ data: undefined, isLoading: true } as any)
    renderDashboard()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('affiche le message "Aucun chantier" quand la liste est vide', () => {
    renderDashboard()
    expect(screen.getByText('Aucun chantier pour le moment')).toBeInTheDocument()
  })
})
