import { Card, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useAppLocale } from '../i18n/LocaleContext.ts'
import { isSupportedLocale, SUPPORTED_LOCALES } from '../i18n/locales.ts'

// Placeholder page that proves HeroUI, Tailwind and react-intl are wired up. Replaced by the router later.
export function App() {
  const intl = useIntl()
  const { locale, setLocale } = useAppLocale()

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            <FormattedMessage id="app.title" />
          </h1>
          <p className="text-muted">
            <FormattedMessage id="app.subtitle" />
          </p>
        </div>
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
            <ToggleButton key={option} id={option} data-testid={`locale-switch-${option}`}>
              <FormattedMessage id={`locale.${option}`} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </header>

      <Card>
        <Card.Content data-testid="setup-check-text">
          <FormattedMessage
            id="setup.check"
            values={{ amount: intl.formatNumber(1234.56, { style: 'currency', currency: 'EUR' }) }}
          />
        </Card.Content>
      </Card>
    </main>
  )
}
