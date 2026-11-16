import { useIntl } from 'react-intl'
import { NavItem } from './NavItem.tsx'
import { NAV_ITEMS } from './navItems.ts'

interface NavListProps {
  collapsed: boolean
  onNavigate?: () => void
}

export function NavList({ collapsed, onNavigate }: NavListProps) {
  const intl = useIntl()

  return (
    <nav aria-label={intl.formatMessage({ id: 'nav.label' })}>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </nav>
  )
}
