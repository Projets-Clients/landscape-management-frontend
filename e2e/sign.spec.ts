import { test, expect, type Page } from '@playwright/test'

const PUBLIC_REPORT = {
  project: {
    id: 'proj-1',
    reference: 'CH-2026-001',
    title: 'Aménagement Jardin Martin',
    description: 'Rénovation complète du jardin',
    address: '5 rue des Roses, Lyon',
    status: 'AWAITING_SIGNATURE',
    startDate: '2026-06-01',
    actualEndDate: null,
  },
  client: {
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre.martin@example.com',
    phone: null,
  },
  report: { comment: 'Travaux réalisés conformément au devis.' },
  photos: [],
  pdfUrl: null,
}

async function mockPublicReport(
  page: Page,
  token: string,
  alreadySigned = false,
  pdfUrl: string | null = null,
) {
  await page.route(`**/public/${token}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...PUBLIC_REPORT, alreadySigned, pdfUrl }),
    }),
  )
}

// ── Token invalide ─────────────────────────────────────────────────────────

test('token invalide → "Lien invalide ou expiré"', async ({ page }) => {
  await page.route('**/public/invalid-token', (route) =>
    route.fulfill({ status: 404 }),
  )
  await page.goto('/sign/invalid-token')
  await expect(page.getByText('Lien invalide ou expiré')).toBeVisible()
})

// ── Token déjà utilisé ─────────────────────────────────────────────────────

test('token déjà signé → "Document déjà signé"', async ({ page }) => {
  await mockPublicReport(page, 'used-token', true)
  await page.goto('/sign/used-token')
  await expect(page.getByText('Document déjà signé')).toBeVisible()
  await expect(page.getByText('Ce rapport a déjà été signé.')).toBeVisible()
})

test('token déjà signé avec PDF → lien de téléchargement visible', async ({ page }) => {
  await mockPublicReport(page, 'used-token-pdf', true, 'https://example.com/report.pdf')
  await page.goto('/sign/used-token-pdf')
  await expect(page.getByRole('link', { name: 'Télécharger le rapport PDF' })).toBeVisible()
})

// ── Token valide ───────────────────────────────────────────────────────────

test('token valide → affiche le formulaire de signature', async ({ page }) => {
  await mockPublicReport(page, 'valid-token', false)
  await page.goto('/sign/valid-token')
  await expect(page.getByText('Aménagement Jardin Martin')).toBeVisible()
  await expect(page.getByText('Pierre Martin')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Signer et valider' })).toBeVisible()
})

test('token valide → affiche le rapport et les infos client', async ({ page }) => {
  await mockPublicReport(page, 'valid-token-2', false)
  await page.goto('/sign/valid-token-2')
  await expect(page.getByText('Travaux réalisés conformément au devis.')).toBeVisible()
  await expect(page.getByText('pierre.martin@example.com')).toBeVisible()
})

test('token valide → canvas de signature présent', async ({ page }) => {
  await mockPublicReport(page, 'valid-token-3', false)
  await page.goto('/sign/valid-token-3')
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByText('Signez ici')).toBeVisible()
})
