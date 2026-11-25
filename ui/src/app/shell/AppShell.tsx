import { useMediaQuery } from '@heroui/react'
import { Outlet } from 'react-router'

import { MobileHeader } from './MobileHeader.tsx'
import { Sidebar } from './navigation/Sidebar.tsx'

const DESKTOP_QUERY = '(min-width: 48rem)'

export function AppShell() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  return (
    <div className="flex min-h-svh">
      {isDesktop && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        {!isDesktop && <MobileHeader />}
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
