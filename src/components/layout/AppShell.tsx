import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="hidden lg:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header className="lg:hidden" />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
        <BottomNav className="lg:hidden" />
      </div>
    </div>
  )
}
