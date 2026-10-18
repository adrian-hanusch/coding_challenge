import { I18nProvider } from '@heroui/react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { IntlProvider } from 'react-intl'
import { LocaleContext } from './LocaleContext.ts'
import { DEFAULT_LOCALE, detectBrowserLocale, type Locale, MESSAGES } from './locales.ts'

/**
 * Single source of truth for the locale. react-intl (texts, formatting) and React Aria
 * (number parsing in `NumberField`, date formats) must always agree, see A19.
 */
export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(() => initialLocale ?? detectBrowserLocale())
  const contextValue = useMemo(() => ({ locale, setLocale }), [locale])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LocaleContext value={contextValue}>
      <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={MESSAGES[locale]}>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </IntlProvider>
    </LocaleContext>
  )
}
