import { I18nProvider } from '@heroui/react'
import { type ReactNode, useEffect } from 'react'
import { IntlProvider } from 'react-intl'
import { useLocaleStore } from './localeStore.ts'
import { DEFAULT_LOCALE, MESSAGES } from './locales.ts'

// react-intl and React Aria must always use the same locale, see A19.
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={MESSAGES[locale]}>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </IntlProvider>
  )
}
