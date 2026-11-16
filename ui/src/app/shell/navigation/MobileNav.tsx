import { Button, Drawer } from '@heroui/react'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { BrandLogo } from '../Brand.tsx'
import { NavList } from './NavList.tsx'

export function MobileNav() {
  const intl = useIntl()
  const [isOpen, setOpen] = useState(false)

  return (
    <Drawer isOpen={isOpen} onOpenChange={setOpen}>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label={intl.formatMessage({ id: 'nav.open' })}
        data-testid="mobile-nav-open"
      >
        <Menu className="size-5" aria-hidden />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="left" className="w-72 max-w-[85vw]">
          <Drawer.Dialog>
            <Drawer.CloseTrigger aria-label={intl.formatMessage({ id: 'nav.close' })} />
            <Drawer.Header className="flex-row items-center gap-3">
              <BrandLogo />
              <Drawer.Heading className="truncate">
                <FormattedMessage id="app.title" />
              </Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <NavList collapsed={false} onNavigate={() => setOpen(false)} />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}
