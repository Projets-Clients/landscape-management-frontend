import type { Page } from '@playwright/test'
import type { Paginated, Project } from '../src/types/api'

// ── JWT ────────────────────────────────────────────────────────────────────

function makeJwt(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.sig`
}

export const ADMIN_TOKEN = makeJwt({ sub: 'user-admin', role: 'ADMIN', exp: 9999999999 })
export const FOREMAN_TOKEN = makeJwt({ sub: 'user-foreman', role: 'FOREMAN', exp: 9999999999 })

// ── Auth mocks ─────────────────────────────────────────────────────────────

export async function mockLoggedIn(page: Page, token = ADMIN_TOKEN) {
  await page.route('**/auth/refresh', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: token }),
    }),
  )
}

export async function mockLoggedOut(page: Page) {
  await page.route('**/auth/refresh', (route) =>
    route.fulfill({ status: 401 }),
  )
}

export async function mockLoginSuccess(page: Page, token = ADMIN_TOKEN) {
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: token }),
    }),
  )
}

export async function mockLoginFailure(page: Page, status = 401) {
  await page.route('**/auth/login', (route) =>
    route.fulfill({ status }),
  )
}

// ── Projects fixtures ──────────────────────────────────────────────────────

export const PROJECT_FIXTURE: Project = {
  id: 'proj-1',
  reference: 'CH-2026-001',
  title: 'Aménagement Jardin Martin',
  address: '5 rue des Roses, Lyon',
  status: 'IN_PROGRESS',
  clientId: 'client-1',
  createdById: 'user-admin',
  closedById: null,
  closedAt: null,
  description: 'Rénovation complète du jardin',
  notes: null,
  quoteAmount: '3500.00',
  startDate: '2026-06-01',
  expectedEndDate: '2026-07-15',
  actualEndDate: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  client: { id: 'client-1', firstName: 'Pierre', lastName: 'Martin' },
}

export function paginatedProjects(items: Project[]): Paginated<Project> {
  return { data: items, total: items.length, page: 1, limit: 20 }
}

export async function mockProjectsList(page: Page, projects = [PROJECT_FIXTURE]) {
  await page.route('**/projects?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paginatedProjects(projects)),
    }),
  )
}

export async function mockProjectDetail(page: Page, project = PROJECT_FIXTURE) {
  await page.route(`**/projects/${project.id}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...project,
        client: {
          id: 'client-1',
          firstName: 'Pierre',
          lastName: 'Martin',
          email: 'pierre.martin@example.com',
          phone: null,
          address: null,
          notes: null,
          active: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        assignments: [],
      }),
    }),
  )
  // Photos + report stubs
  await page.route(`**/projects/${project.id}/photos`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
  )
  await page.route(`**/projects/${project.id}/report`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) }),
  )
}
