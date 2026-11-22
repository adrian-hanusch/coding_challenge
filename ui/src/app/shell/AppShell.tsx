import { useMediaQuery } from '@heroui/react'
import { Outlet } from 'react-router'

import { AppHeader } from './AppHeader.tsx'
import { Brand } from './Brand.tsx'
import { MobileNav } from './navigation/MobileNav.tsx'
import { Sidebar } from './navigation/Sidebar.tsx'

const DESKTOP_QUERY = '(min-width: 48rem)'

export function AppShell() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {isDesktop && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          leading={
            !isDesktop && (
              <>
                <MobileNav />
                <Brand />
              </>
            )
          }
        />
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
