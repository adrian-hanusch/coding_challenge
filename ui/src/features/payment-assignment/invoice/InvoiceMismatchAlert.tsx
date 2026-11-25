import type { ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Money } from '../../../api/types.ts'
import { Notice } from '../../../components/Notice.tsx'
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
    <Notice
      status="warning"
      title={
        <FormattedMessage
          id="invoice.amountMismatch.title"
          values={{ direction: difference < 0 ? 'lower' : 'higher', difference: formatCents(Math.abs(difference)) }}
        />
      }
      description={children}
      {...rest}
    />
  )
}
