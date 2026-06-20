import { test, expect } from '@playwright/test'
import {
  mockLoggedIn,
  mockProjectsList,
  PROJECT_FIXTURE,
  FOREMAN_TOKEN,
} from './helpers'

test.beforeEach(async ({ page }) => {
  await mockLoggedIn(page)
  await mockProjectsList(page, [PROJECT_FIXTURE])
})

// ── Rendu ──────────────────────────────────────────────────────────────────

test('affiche le titre et un projet', async ({ page }) => {
  await page.goto('/chantiers')
  await expect(page.getByRole('heading', { name: 'Chantiers' })).toBeVisible()
  await expect(page.getByText('Aménagement Jardin Martin')).toBeVisible()
  await expect(page.getByText('CH-2026-001')).toBeVisible()
})

test('affiche les chips de filtres', async ({ page }) => {
  await page.goto('/chantiers')
  for (const label of ['Tous', 'Brouillon', 'Planifié', 'En cours', 'Signature', 'Terminé']) {
    await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
  }
})

// ── Filtre par statut ──────────────────────────────────────────────────────

test('chip "Tous" actif par défaut', async ({ page }) => {
  await page.goto('/chantiers')
  const chip = page.getByRole('button', { name: 'Tous' })
  await expect(chip).toHaveClass(/bg-primary/)
})

test('clic sur un chip met à jour le chip actif et l\'URL', async ({ page }) => {
  await page.goto('/chantiers')
  await page.getByRole('button', { name: 'En cours', exact: true }).click()
  await expect(page).toHaveURL(/status=IN_PROGRESS/)
  await expect(page.getByRole('button', { name: 'En cours', exact: true })).toHaveClass(/bg-primary/)
  await expect(page.getByRole('button', { name: 'Tous', exact: true })).not.toHaveClass(/bg-primary/)
})

test('clic sur "Tous" réinitialise le filtre URL', async ({ page }) => {
  await page.goto('/chantiers?status=IN_PROGRESS')
  await page.getByRole('button', { name: 'Tous' }).click()
  await expect(page).not.toHaveURL(/status=/)
  await expect(page.getByRole('button', { name: 'Tous' })).toHaveClass(/bg-primary/)
})

// ── Recherche ──────────────────────────────────────────────────────────────

test('recherche filtre les projets par titre', async ({ page }) => {
  await page.goto('/chantiers')
  await page.getByPlaceholder(/rechercher/i).fill('Martin')
  await expect(page.getByText('Aménagement Jardin Martin')).toBeVisible()
})

test('recherche sans résultat affiche "Aucun résultat"', async ({ page }) => {
  await page.goto('/chantiers')
  await page.getByPlaceholder(/rechercher/i).fill('xxxxxxxxxxx')
  await expect(page.getByText('Aucun résultat')).toBeVisible()
  await expect(page.getByText('Aménagement Jardin Martin')).not.toBeVisible()
})

test('bouton X efface la recherche', async ({ page }) => {
  await page.goto('/chantiers')
  await page.getByPlaceholder(/rechercher/i).fill('xxxxxxxxxxx')
  await page.getByRole('button', { name: 'Effacer la recherche' }).click()
  await expect(page.getByText('Aménagement Jardin Martin')).toBeVisible()
})

// ── Accès par rôle ─────────────────────────────────────────────────────────

test('ADMIN : bouton "Nouveau" visible', async ({ page }) => {
  await page.goto('/chantiers')
  await expect(page.getByRole('button', { name: /nouveau/i })).toBeVisible()
})

test('FOREMAN : bouton "Nouveau" absent', async ({ page }) => {
  await mockLoggedIn(page, FOREMAN_TOKEN)
  await page.goto('/chantiers')
  await expect(page.getByRole('button', { name: /nouveau/i })).not.toBeVisible()
})
