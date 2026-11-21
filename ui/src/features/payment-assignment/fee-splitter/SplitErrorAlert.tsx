import { Alert } from '@heroui/react'
import type { ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'
import type { Money } from '../../../api/types.ts'
import type { SplitError } from '../../../domain/split.ts'
import { useFormatCents } from '../../../lib/useFormatMoney.ts'

export function SplitErrorAlert({ error, paymentAmount }: { error: SplitError; paymentAmount: Money }) {
  const money = useFormatCents(paymentAmount.currency)
  const payment = money(paymentAmount.amountMinor)

  let title: ReactNode
  let description: ReactNode
  switch (error.code) {
    case 'feesExceedPayment':
      title = <FormattedMessage id="feeSplit.error.feesExceedPayment" values={{ excess: money(error.excess) }} />
      description = <FormattedMessage id="feeSplit.error.feesExceedPayment.description" values={{ payment }} />
      break
    case 'sumMismatch':
      title = (
        <FormattedMessage
          id="feeSplit.error.sumMismatch"
          values={{
            total: money(error.total),
            payment,
            difference: money(Math.abs(error.difference)),
            direction: error.difference > 0 ? 'missing' : 'excess',
          }}
        />
      )
      description = <FormattedMessage id="feeSplit.error.sumMismatch.description" />
      break
  }

  return (
    <Alert status="danger" role="alert" data-testid="split-error">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{description}</Alert.Description>
      </Alert.Content>
    </Alert>
  )
}
