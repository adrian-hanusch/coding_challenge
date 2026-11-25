import { Button, cn, Dropdown, Label, Tooltip } from '@heroui/react'
import { ChevronsUpDown, Languages } from 'lucide-react'
import { useIntl } from 'react-intl'

import { isSupportedLocale, LOCALE_NAMES, SUPPORTED_LOCALES } from '../../i18n/locales.ts'
import { useLocaleStore } from '../../i18n/localeStore.ts'
import { navRow } from './navigation/navRow.ts'

export function LocaleMenu({ collapsed = false }: { collapsed?: boolean }) {
  const intl = useIntl()
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const label = intl.formatMessage({ id: 'locale.label' }, { name: LOCALE_NAMES[locale] })

  return (
    <Dropdown>
      <Tooltip delay={0} isDisabled={!collapsed}>
        <Button variant="ghost" aria-label={label} className={navRow(collapsed)} data-testid="locale-menu">
          {/* Without HeroUI's negative icon margin, so it lines up with the navigation icons. */}
          <Languages aria-hidden className="mx-0!" />
          {!collapsed && (
            <>
              {LOCALE_NAMES[locale]}
              <ChevronsUpDown aria-hidden className="ml-auto text-muted" />
            </>
          )}
        </Button>
        <Tooltip.Content placement="right">{label}</Tooltip.Content>
      </Tooltip>
      <Dropdown.Popover placement="top start" className={cn(!collapsed && 'max-w-none min-w-(--trigger-width)')}>
        <Dropdown.Menu
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[locale]}
          onSelectionChange={(keys) => {
            const [next] = keys
            if (typeof next === 'string' && isSupportedLocale(next)) setLocale(next)
          }}
        >
          {SUPPORTED_LOCALES.map((option) => (
            <Dropdown.Item
              key={option}
              id={option}
              textValue={LOCALE_NAMES[option]}
              data-testid={`locale-option-${option}`}
            >
              <Dropdown.ItemIndicator />
              <Label lang={option}>{LOCALE_NAMES[option]}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
