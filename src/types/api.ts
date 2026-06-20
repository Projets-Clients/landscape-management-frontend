export type UserRole = 'ADMIN' | 'FOREMAN' | 'EMPLOYEE'

export type ProjectStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'AWAITING_SIGNATURE'
  | 'COMPLETED'
  | 'DISPUTED'

export type PhotoType = 'BEFORE' | 'AFTER'

export interface User {
  id: string
  username: string
  email: string | null
  firstName: string
  lastName: string
  role: UserRole
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  notes: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectAssignment {
  userId: string
  user?: {
    id: string
    firstName: string
    lastName: string
    role: UserRole
  }
}

export interface Project {
  id: string
  reference: string
  title: string
  description: string | null
  notes: string | null
  address: string
  quoteAmount: string | null
  startDate: string | null
  expectedEndDate: string | null
  actualEndDate: string | null
  status: ProjectStatus
  clientId: string
  createdById: string
  closedById: string | null
  closedAt: string | null
  client?: {
    id: string
    firstName: string
    lastName: string
  }
  assignments?: ProjectAssignment[]
  createdAt: string
  updatedAt: string
}

export interface ProjectDetail extends Omit<Project, 'client' | 'assignments'> {
  client: Client
  assignments: Required<ProjectAssignment>[]
}

export interface Photo {
  id: string
  projectId: string
  uploadedById: string
  storageKey: string
  type: PhotoType
  order: number
  signedUrl: string | null
  createdAt: string
}

export interface Report {
  id: string
  projectId: string
  comment: string | null
  pdfKey: string | null
  createdAt: string
  updatedAt: string
}

export interface SignatureRequest {
  id: string
  projectId: string
  token: string
  usedAt: string | null
  createdAt: string
}

export interface PublicProject {
  id: string
  reference: string
  title: string
  description: string | null
  address: string
  status: ProjectStatus
  startDate: string | null
  expectedEndDate: string | null
  actualEndDate: string | null
}

export interface PublicClient {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

export interface PublicReport {
  project: PublicProject
  client: PublicClient
  report: { comment: string | null } | null
  photos: Photo[]
  pdfUrl: string | null
  alreadySigned: boolean
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface LoginResponse {
  accessToken: string
}
