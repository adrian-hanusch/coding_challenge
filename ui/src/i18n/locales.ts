import de from './messages/de.json'
import en from './messages/en.json'

export const SUPPORTED_LOCALES = ['en', 'de'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** In their own language, so users find theirs whatever the current one is. */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', de: 'Deutsch' }

export const DEFAULT_LOCALE: Locale = 'en'

// Types every message id and locale passed to react-intl (`<FormattedMessage id>`, `formatMessage`, `IntlProvider`).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- FormatJS is typed by augmenting this global namespace
  namespace FormatjsIntl {
    interface Message {
      ids: keyof typeof en
    }
    interface IntlConfig {
      locale: Locale
    }
  }
}

// `satisfies` makes the compiler reject a locale file that is missing a key.
export const MESSAGES = { en, de } satisfies Record<Locale, Record<keyof typeof en, string>>

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/**
 * Picks the first browser language we support, e.g. `de-AT` → `de`. Falls back to English.
 * Parses the tag by hand because `Intl.Locale` throws on malformed tags such as `en_US` or `*`.
 */
export function detectBrowserLocale(languages: readonly string[] = navigator.languages): Locale {
  return languages.map((tag) => tag.split(/[-_]/)[0]?.toLowerCase() ?? '').find(isSupportedLocale) ?? DEFAULT_LOCALE
}
