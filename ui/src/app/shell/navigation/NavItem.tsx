import { cn, Link, Tooltip } from '@heroui/react'
import { useIntl } from 'react-intl'
import { useMatch } from 'react-router'

import type { NavItemConfig } from './navItems.ts'

interface NavItemProps {
  item: NavItemConfig
  collapsed: boolean
  onNavigate?: () => void
}

export function NavItem({ item, collapsed, onNavigate }: NavItemProps) {
  const intl = useIntl()
  const isActive = useMatch({ path: item.to, end: false }) !== null
  const label = intl.formatMessage({ id: item.labelId })
  const Icon = item.icon

  return (
    <Tooltip delay={0} isDisabled={!collapsed}>
      <Link
        href={item.to}
        onPress={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        aria-label={collapsed ? label : undefined}
        data-testid={`nav-${item.to}`}
        className={cn(
          'flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground no-underline',
          'transition-colors hover:bg-default hover:no-underline',
          isActive && 'bg-accent-soft text-accent-soft-foreground hover:bg-accent-soft-hover',
          collapsed && 'justify-center px-0',
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
      <Tooltip.Content placement="right">{label}</Tooltip.Content>
    </Tooltip>
  )
}
