import { test, expect } from '@playwright/test'
import {
  ADMIN_TOKEN,
  mockLoggedIn,
  mockLoggedOut,
  mockLoginSuccess,
  mockLoginFailure,
  mockProjectsList,
} from './helpers'

// ── Redirection ────────────────────────────────────────────────────────────

test('redirige vers /login si non connecté', async ({ page }) => {
  await mockLoggedOut(page)
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})

test('reste sur / si connecté', async ({ page }) => {
  await mockLoggedIn(page)
  await mockProjectsList(page, [])
  await page.goto('/')
  await expect(page).not.toHaveURL('/login')
})

// ── Formulaire ─────────────────────────────────────────────────────────────

test('affiche le formulaire de connexion', async ({ page }) => {
  await mockLoggedOut(page)
  await page.goto('/login')
  await expect(page.getByLabel('Identifiant')).toBeVisible()
  await expect(page.getByLabel('Mot de passe')).toBeVisible()
  await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Landscape' })).toBeVisible()
})

// ── Connexion réussie ──────────────────────────────────────────────────────

test('connexion réussie → redirige vers /', async ({ page }) => {
  await mockLoggedOut(page)
  await mockLoginSuccess(page, ADMIN_TOKEN)
  await mockProjectsList(page, [])
  await page.goto('/login')
  await page.getByLabel('Identifiant').fill('admin')
  await page.getByLabel('Mot de passe').fill('Admin123!')
  await page.getByRole('button', { name: /se connecter/i }).click()
  await expect(page).toHaveURL('/')
})

// ── Erreurs ────────────────────────────────────────────────────────────────

test('mauvais identifiants → toast "Identifiants incorrects"', async ({ page }) => {
  await mockLoggedOut(page)
  await mockLoginFailure(page, 401)
  await page.goto('/login')
  await page.getByLabel('Identifiant').fill('admin')
  await page.getByLabel('Mot de passe').fill('mauvaismdp')
  await page.getByRole('button', { name: /se connecter/i }).click()
  await expect(page.getByText('Identifiants incorrects')).toBeVisible()
})

test('erreur réseau → toast "Erreur de connexion, réessayez"', async ({ page }) => {
  await mockLoggedOut(page)
  await page.route('**/auth/login', (route) => route.abort('failed'))
  await page.goto('/login')
  await page.getByLabel('Identifiant').fill('admin')
  await page.getByLabel('Mot de passe').fill('Admin123!')
  await page.getByRole('button', { name: /se connecter/i }).click()
  await expect(page.getByText('Erreur de connexion, réessayez')).toBeVisible()
})

// ── État de chargement ─────────────────────────────────────────────────────

test('bouton disabled + texte "Connexion…" pendant le submit', async ({ page }) => {
  await mockLoggedOut(page)
  // Réponse qui ne résout jamais → état de chargement permanent
  await page.route('**/auth/login', () => { /* never resolve */ })
  await page.goto('/login')
  await page.getByLabel('Identifiant').fill('admin')
  await page.getByLabel('Mot de passe').fill('Admin123!')
  await page.getByRole('button', { name: /se connecter/i }).click()
  const btn = page.getByRole('button', { name: /connexion/i })
  await expect(btn).toBeDisabled()
  await expect(btn).toHaveText('Connexion…')
})
