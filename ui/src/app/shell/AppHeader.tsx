import type { ReactNode } from 'react'

import { LocaleSwitch } from './LocaleSwitch.tsx'

export function AppHeader({ leading }: { leading?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-separator bg-background px-4">
      {leading}
      <div className="ml-auto shrink-0">
        <LocaleSwitch />
      </div>
    </header>
  )
}
