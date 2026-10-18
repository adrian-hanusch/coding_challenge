import { createContext, useContext } from 'react'
import type { Locale } from './locales.ts'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useAppLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useAppLocale must be used within a LocaleProvider')
  }
  return context
}
