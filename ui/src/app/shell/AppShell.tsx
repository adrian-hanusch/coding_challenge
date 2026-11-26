import { Outlet } from 'react-router'

import { Brand } from './Brand.tsx'
import { LocaleMenu } from './LocaleMenu.tsx'

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-separator bg-background px-4 sm:px-8">
        <Brand />
        <div className="ms-auto">
          <LocaleMenu />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}
