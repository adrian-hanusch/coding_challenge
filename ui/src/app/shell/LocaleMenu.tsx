import { Button, Dropdown, Label } from '@heroui/react'
import { ChevronDown, Languages } from 'lucide-react'
import { useIntl } from 'react-intl'

import { isSupportedLocale, LOCALE_NAMES, SUPPORTED_LOCALES } from '../../i18n/locales.ts'
import { useLocaleStore } from '../../i18n/localeStore.ts'

export function LocaleMenu() {
  const intl = useIntl()
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)

  return (
    <Dropdown>
      <Button
        variant="ghost"
        size="sm"
        aria-label={intl.formatMessage({ id: 'locale.label' }, { name: LOCALE_NAMES[locale] })}
        data-testid="locale-menu"
      >
        <Languages aria-hidden />
        {LOCALE_NAMES[locale]}
        <ChevronDown aria-hidden className="text-muted" />
      </Button>
      <Dropdown.Popover placement="bottom end">
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
