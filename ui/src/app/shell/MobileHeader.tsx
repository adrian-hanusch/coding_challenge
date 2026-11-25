import { Brand } from './Brand.tsx'
import { MobileNav } from './navigation/MobileNav.tsx'

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-separator bg-background px-4">
      <MobileNav />
      <Brand />
    </header>
  )
}
