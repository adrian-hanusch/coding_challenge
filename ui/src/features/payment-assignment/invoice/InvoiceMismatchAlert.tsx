import { Alert } from '@heroui/react'
import type { ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Money } from '../../../api/types.ts'
import { useFormatCents } from '../../../lib/useFormatMoney.ts'

interface InvoiceMismatchAlertProps {
  /** Payment minus invoice amount, not 0. */
  difference: number
  currency: Money['currency']
  children?: ReactNode
  'data-testid'?: string
}

export function InvoiceMismatchAlert({ difference, currency, children, ...rest }: InvoiceMismatchAlertProps) {
  const formatCents = useFormatCents(currency)

  return (
    <Alert status="warning" {...rest}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>
          <FormattedMessage
            id="invoice.amountMismatch.title"
            values={{ direction: difference < 0 ? 'lower' : 'higher', difference: formatCents(Math.abs(difference)) }}
          />
        </Alert.Title>
        {children ? <Alert.Description>{children}</Alert.Description> : null}
      </Alert.Content>
    </Alert>
  )
}
