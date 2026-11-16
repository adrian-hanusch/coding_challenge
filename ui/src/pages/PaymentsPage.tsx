import { Card } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { FormattedMessage, useIntl } from 'react-intl'
import { ApiError } from '../api/client.ts'
import { paymentQueryOptions } from '../api/payments.ts'

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

// Placeholder page that proves HeroUI, Tailwind, react-intl and the API are wired up.
export function PaymentsPage() {
  const intl = useIntl()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          <FormattedMessage id="app.title" />
        </h1>
        <p className="text-muted">
          <FormattedMessage id="app.subtitle" />
        </p>
      </div>

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
    </div>
  )
}
