import { Button, Tooltip } from '@heroui/react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useIntl } from 'react-intl'

interface SidebarToggleProps {
  collapsed: boolean
  onToggle: () => void
  controlsId: string
}

export function SidebarToggle({ collapsed, onToggle, controlsId }: SidebarToggleProps) {
  const intl = useIntl()
  const label = intl.formatMessage({ id: collapsed ? 'nav.expand' : 'nav.collapse' })
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <Tooltip delay={0}>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label={label}
        aria-expanded={!collapsed}
        aria-controls={controlsId}
        onPress={onToggle}
        data-testid="sidebar-toggle"
      >
        <Icon className="size-4" aria-hidden />
      </Button>
      <Tooltip.Content placement="right">{label}</Tooltip.Content>
    </Tooltip>
  )
}
