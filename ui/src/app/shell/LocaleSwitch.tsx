import { ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { useIntl } from 'react-intl'

import { isSupportedLocale, SUPPORTED_LOCALES } from '../../i18n/locales.ts'
import { useLocaleStore } from '../../i18n/localeStore.ts'

export function LocaleSwitch() {
  const intl = useIntl()
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)

  return (
    <ToggleButtonGroup
      aria-label={intl.formatMessage({ id: 'locale.label' })}
      size="sm"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[locale]}
      onSelectionChange={(keys) => {
        const [next] = keys
        if (typeof next === 'string' && isSupportedLocale(next)) setLocale(next)
      }}
      data-testid="locale-switch-group"
    >
      {SUPPORTED_LOCALES.map((option) => (
        <ToggleButton
          key={option}
          id={option}
          aria-label={intl.formatMessage({ id: `locale.${option}` })}
          data-testid={`locale-switch-${option}`}
        >
          <span aria-hidden>{option.toUpperCase()}</span>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
