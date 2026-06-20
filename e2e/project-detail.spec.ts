import { test, expect } from '@playwright/test'
import {
  mockLoggedIn,
  mockProjectsList,
  mockProjectDetail,
  PROJECT_FIXTURE,
  FOREMAN_TOKEN,
} from './helpers'

test.beforeEach(async ({ page }) => {
  await mockLoggedIn(page)
  await mockProjectsList(page, [PROJECT_FIXTURE])
  await mockProjectDetail(page, PROJECT_FIXTURE)
})

// ── Navigation vers la fiche ───────────────────────────────────────────────

test('cliquer sur un projet navigue vers la fiche', async ({ page }) => {
  await page.goto('/chantiers')
  await page.getByText('Aménagement Jardin Martin').click()
  await expect(page).toHaveURL(`/chantiers/${PROJECT_FIXTURE.id}`)
})

// ── Contenu de la fiche ────────────────────────────────────────────────────

test('affiche le titre, la référence et le statut', async ({ page }) => {
  await page.goto(`/chantiers/${PROJECT_FIXTURE.id}`)
  await expect(page.getByRole('heading', { name: 'Aménagement Jardin Martin' })).toBeVisible()
  await expect(page.getByText('CH-2026-001')).toBeVisible()
  await expect(page.getByText('En cours').first()).toBeVisible()
})

test('affiche l\'adresse du chantier', async ({ page }) => {
  await page.goto(`/chantiers/${PROJECT_FIXTURE.id}`)
  await expect(page.getByText('5 rue des Roses, Lyon')).toBeVisible()
})

test('affiche le nom du client', async ({ page }) => {
  await page.goto(`/chantiers/${PROJECT_FIXTURE.id}`)
  await expect(page.getByText('Pierre Martin')).toBeVisible()
})

// ── Bouton d\'édition ──────────────────────────────────────────────────────

test('ADMIN : bouton édition (crayon) visible', async ({ page }) => {
  await page.goto(`/chantiers/${PROJECT_FIXTURE.id}`)
  await expect(page.getByRole('button', { name: 'Modifier le chantier' })).toBeVisible()
})

test('ADMIN : clic sur crayon navigue vers /modifier', async ({ page }) => {
  await page.goto(`/chantiers/${PROJECT_FIXTURE.id}`)
  await page.getByRole('button', { name: 'Modifier le chantier' }).click()
  await expect(page).toHaveURL(`/chantiers/${PROJECT_FIXTURE.id}/modifier`)
})

test('FOREMAN : bouton édition absent', async ({ page }) => {
  await mockLoggedIn(page, FOREMAN_TOKEN)
  await page.goto(`/chantiers/${PROJECT_FIXTURE.id}`)
  await expect(page.getByRole('button', { name: 'Modifier le chantier' })).not.toBeVisible()
})

// ── Navigation retour ──────────────────────────────────────────────────────

test('bouton retour navigue vers la liste', async ({ page }) => {
  await page.goto('/chantiers')
  await page.getByText('Aménagement Jardin Martin').click()
  await expect(page).toHaveURL(`/chantiers/${PROJECT_FIXTURE.id}`)
  await page.locator('button').filter({ has: page.locator('svg') }).first().click()
  await expect(page).toHaveURL('/chantiers')
})
