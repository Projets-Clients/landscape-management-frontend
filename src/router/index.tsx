import { createBrowserRouter } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'
import { AppShell } from '@/components/layout/AppShell'
import { ScrollLayout } from '@/components/layout/ScrollLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage'
import { PhotosPage } from '@/pages/projects/PhotosPage'
import { ReportPage } from '@/pages/projects/ReportPage'
import { CreateProjectPage } from '@/pages/projects/CreateProjectPage'
import { EditProjectPage } from '@/pages/projects/EditProjectPage'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { ClientDetailPage } from '@/pages/clients/ClientDetailPage'
import { CreateClientPage } from '@/pages/clients/CreateClientPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { SignPage } from '@/pages/public/SignPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/sign/:token',
    element: <SignPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Pages with sticky header + footer (manage their own scroll)
          { path: 'chantiers', element: <ProjectsPage /> },
          {
            element: <RoleRoute allowed={['ADMIN']} />,
            children: [
              { path: 'clients', element: <ClientsPage /> },
            ],
          },
          // All other pages scroll normally inside ScrollLayout
          {
            element: <ScrollLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'chantiers/:id', element: <ProjectDetailPage /> },
              { path: 'chantiers/:id/photos', element: <PhotosPage /> },
              { path: 'chantiers/:id/rapport', element: <ReportPage /> },
              { path: 'parametres', element: <SettingsPage /> },
              {
                element: <RoleRoute allowed={['ADMIN']} />,
                children: [
                  { path: 'chantiers/nouveau', element: <CreateProjectPage /> },
                  { path: 'chantiers/:id/modifier', element: <EditProjectPage /> },
                  { path: 'clients/nouveau', element: <CreateClientPage /> },
                  { path: 'clients/:id', element: <ClientDetailPage /> },
                  { path: 'utilisateurs', element: <UsersPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
