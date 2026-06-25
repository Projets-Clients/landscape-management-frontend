import { Outlet } from 'react-router-dom'

export function ScrollLayout() {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4">
      <Outlet />
    </div>
  )
}
