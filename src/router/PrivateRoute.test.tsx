import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { useAuthStore } from '@/store/auth.store'

// ── Helpers ────────────────────────────────────────────────────────────────

function renderWithRouter(accessToken: string | null) {
  useAuthStore.setState({ accessToken, username: '', role: null, userId: null })

  render(
    <MemoryRouter initialEntries={['/protege']}>
      <Routes>
        <Route path="/login" element={<div>Page Login</div>} />
        <Route element={<PrivateRoute />}>
          <Route path="/protege" element={<div>Contenu protégé</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

// ── Reset ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  sessionStorage.clear()
  useAuthStore.setState({ accessToken: null, username: '', role: null, userId: null })
})

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PrivateRoute', () => {
  it('redirige vers /login quand accessToken est null', () => {
    renderWithRouter(null)
    expect(screen.getByText('Page Login')).toBeInTheDocument()
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument()
  })

  it('rend le contenu protégé quand accessToken est présent', () => {
    renderWithRouter('un-token-valide')
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument()
    expect(screen.queryByText('Page Login')).not.toBeInTheDocument()
  })

  it('redirige si le token est une chaîne vide', () => {
    renderWithRouter('')
    // Une chaîne vide est falsy — doit rediriger
    expect(screen.getByText('Page Login')).toBeInTheDocument()
  })
})
