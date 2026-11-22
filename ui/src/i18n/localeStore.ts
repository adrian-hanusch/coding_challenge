import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { detectBrowserLocale, isSupportedLocale, type Locale } from './locales.ts'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: detectBrowserLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'app.locale',
      partialize: (state) => ({ locale: state.locale }),
      // Stored data is untrusted, so a locale that is not (or no longer) supported is ignored.
      merge: (persisted, current) => {
        const locale = (persisted as Partial<LocaleState> | undefined)?.locale
        return typeof locale === 'string' && isSupportedLocale(locale) ? { ...current, locale } : current
      },
    },
  ),
)
