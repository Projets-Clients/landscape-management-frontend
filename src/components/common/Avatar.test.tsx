import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

const USER = { id: 'seed-user-foreman', firstName: 'Jean', lastName: 'Dupont' }

// ── Contenu rendu ──────────────────────────────────────────────────────────

describe('Avatar — contenu', () => {
  it('affiche les initiales du prénom et du nom', () => {
    render(<Avatar {...USER} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('affiche les initiales en majuscules', () => {
    render(<Avatar id="x" firstName="sarah" lastName="bernard" />)
    expect(screen.getByText('SB')).toBeInTheDocument()
  })

  it('expose le nom complet dans l\'attribut title', () => {
    const { container } = render(<Avatar {...USER} />)
    expect((container.firstChild as HTMLElement).title).toBe('Jean Dupont')
  })
})

// ── Tailles ────────────────────────────────────────────────────────────────

describe('Avatar — tailles', () => {
  it('taille par défaut = md (h-9 w-9)', () => {
    const { container } = render(<Avatar {...USER} />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('h-9')
    expect(cls).toContain('w-9')
  })

  it('taille sm → h-7 w-7', () => {
    const { container } = render(<Avatar {...USER} size="sm" />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('h-7')
    expect(cls).toContain('w-7')
  })

  it('taille lg → h-11 w-11', () => {
    const { container } = render(<Avatar {...USER} size="lg" />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('h-11')
    expect(cls).toContain('w-11')
  })
})

// ── Couleur ────────────────────────────────────────────────────────────────

describe('Avatar — couleur', () => {
  it('contient une classe bg-* Tailwind', () => {
    const { container } = render(<Avatar {...USER} />)
    expect((container.firstChild as HTMLElement).className).toMatch(/bg-\w+-\d+/)
  })

  it('est déterministe — même id → même couleur à chaque rendu', () => {
    const { container: c1 } = render(<Avatar {...USER} />)
    const { container: c2 } = render(<Avatar {...USER} />)
    expect((c1.firstChild as HTMLElement).className).toBe(
      (c2.firstChild as HTMLElement).className,
    )
  })

  it('ids différents peuvent produire des couleurs différentes', () => {
    const ids = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8', 'i9', 'j0']
    const classes = ids.map((id) => {
      const { container } = render(<Avatar id={id} firstName="A" lastName="B" />)
      return (container.firstChild as HTMLElement).className
    })
    expect(new Set(classes).size).toBeGreaterThan(1)
  })
})

// ── Prop className ─────────────────────────────────────────────────────────

describe('Avatar — className additionnelle', () => {
  it('fusionne la className externe avec les classes internes', () => {
    const { container } = render(<Avatar {...USER} className="ring-2" />)
    expect((container.firstChild as HTMLElement).className).toContain('ring-2')
  })
})
