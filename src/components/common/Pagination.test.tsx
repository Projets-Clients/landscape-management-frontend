import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

// ── Retour null ─────────────────────────────────────────────────────────────

describe('Pagination — retour null', () => {
  it('ne rend rien quand total < limit (1 page)', () => {
    const { container } = render(
      <Pagination page={1} total={10} limit={20} onChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('ne rend rien quand total = 0', () => {
    const { container } = render(
      <Pagination page={1} total={0} limit={20} onChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('ne rend rien quand total = limit (exactement 1 page)', () => {
    const { container } = render(
      <Pagination page={1} total={20} limit={20} onChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })
})

// ── Rendu avec plusieurs pages ─────────────────────────────────────────────

describe('Pagination — rendu', () => {
  it('affiche "1 / 3" pour page=1, total=60, limit=20', () => {
    render(<Pagination page={1} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('/ 3', { exact: false })).toBeInTheDocument()
  })

  it('affiche "2 / 3" quand on est à la page 2', () => {
    render(<Pagination page={2} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('affiche les boutons précédent et suivant', () => {
    render(<Pagination page={2} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Page précédente')).toBeInTheDocument()
    expect(screen.getByLabelText('Page suivante')).toBeInTheDocument()
  })
})

// ── États disabled ─────────────────────────────────────────────────────────

describe('Pagination — boutons désactivés', () => {
  it('précédent désactivé sur la première page', () => {
    render(<Pagination page={1} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Page précédente')).toBeDisabled()
  })

  it('suivant désactivé sur la dernière page', () => {
    render(<Pagination page={3} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Page suivante')).toBeDisabled()
  })

  it('précédent activé sur la page 2', () => {
    render(<Pagination page={2} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Page précédente')).not.toBeDisabled()
  })

  it('suivant activé sur la page 1 quand il y a plusieurs pages', () => {
    render(<Pagination page={1} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Page suivante')).not.toBeDisabled()
  })
})

// ── Boutons première / dernière page ──────────────────────────────────────

describe('Pagination — première et dernière page', () => {
  it('n\'affiche pas "Première page" quand totalPages = 2', () => {
    render(<Pagination page={1} total={40} limit={20} onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Première page')).not.toBeInTheDocument()
  })

  it('n\'affiche pas "Première page" quand totalPages = 3', () => {
    render(<Pagination page={1} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Première page')).not.toBeInTheDocument()
  })

  it('affiche "Première page" quand totalPages = 4', () => {
    render(<Pagination page={2} total={80} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Première page')).toBeInTheDocument()
  })

  it('n\'affiche pas "Dernière page" quand totalPages = 2', () => {
    render(<Pagination page={1} total={40} limit={20} onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Dernière page')).not.toBeInTheDocument()
  })

  it('affiche "Dernière page" quand totalPages = 3', () => {
    render(<Pagination page={1} total={60} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Dernière page')).toBeInTheDocument()
  })

  it('"Première page" désactivé sur la page 1', () => {
    render(<Pagination page={1} total={80} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Première page')).toBeDisabled()
  })

  it('"Dernière page" désactivé sur la dernière page', () => {
    render(<Pagination page={4} total={80} limit={20} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Dernière page')).toBeDisabled()
  })
})

// ── Callbacks ──────────────────────────────────────────────────────────────

describe('Pagination — callbacks onChange', () => {
  it('cliquer "suivant" appelle onChange(page + 1)', async () => {
    const onChange = vi.fn()
    render(<Pagination page={2} total={60} limit={20} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Page suivante'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('cliquer "précédent" appelle onChange(page - 1)', async () => {
    const onChange = vi.fn()
    render(<Pagination page={2} total={60} limit={20} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Page précédente'))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('cliquer "Première page" appelle onChange(1)', async () => {
    const onChange = vi.fn()
    render(<Pagination page={3} total={80} limit={20} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Première page'))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('cliquer "Dernière page" appelle onChange(totalPages)', async () => {
    const onChange = vi.fn()
    render(<Pagination page={1} total={80} limit={20} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Dernière page'))
    expect(onChange).toHaveBeenCalledWith(4)
  })
})
