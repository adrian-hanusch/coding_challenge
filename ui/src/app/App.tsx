import { Card, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { FormattedMessage, useIntl } from 'react-intl'
import { ApiError } from '../api/client.ts'
import { paymentQueryOptions } from '../api/payments.ts'
import { useAppLocale } from '../i18n/LocaleContext.ts'
import { isSupportedLocale, SUPPORTED_LOCALES } from '../i18n/locales.ts'

// Proves that the (mock) API, TanStack Query and amount formatting work together.
function ApiCheck() {
  const intl = useIntl()
  const { data: payment, error } = useQuery(paymentQueryOptions('pay-exact'))

  if (error) {
    const code = error instanceof ApiError ? error.code : error.name
    return <FormattedMessage id="setup.api.error" values={{ code }} />
  }
  if (!payment) return <FormattedMessage id="setup.api.loading" />
  return (
    <FormattedMessage
      id="setup.api.success"
      values={{
        sender: payment.senderName,
        amount: intl.formatNumber(payment.amount.amountMinor / 100, {
          style: 'currency',
          currency: payment.amount.currency,
        }),
      }}
    />
  )
}

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

      <Card>
        <Card.Content data-testid="setup-api-check-text">
          <ApiCheck />
        </Card.Content>
      </Card>
    </main>
  )
}
