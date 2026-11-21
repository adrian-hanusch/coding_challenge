import { Alert } from '@heroui/react'
import { Typography } from '../../components/Typography.tsx'
import { CircleCheck } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import type { Invoice, Money } from '../../api/types.ts'
import { useFormatCents, useFormatMoney } from '../../lib/useFormatMoney.ts'
import { InvoiceDueDate } from './InvoiceDueDate.tsx'

/** Chosen invoice and its difference to the payment. */
export function SelectedInvoice({ invoice, paymentAmount }: { invoice: Invoice; paymentAmount: Money }) {
  const formatMoney = useFormatMoney()
  const formatCents = useFormatCents(paymentAmount.currency)
  const difference = paymentAmount.amountMinor - invoice.amount.amountMinor

  return (
    <div className="flex flex-col gap-3" data-testid="selected-invoice">
      <div className="flex flex-col gap-4 rounded-2xl bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium">{invoice.merchant.name}</span>
          <Typography type="body-sm" color="muted" elementType="span">
            <span className="tabular-nums">{invoice.invoiceNumber}</span>
            {' · '}
            <InvoiceDueDate dueDate={invoice.dueDate} />
          </Typography>
        </div>
        <div className="flex flex-col sm:items-end">
          <Typography type="body-sm" color="muted" elementType="span">
            <FormattedMessage id="invoice.amount" />
          </Typography>
          <Typography type="h5" className="tabular-nums" elementType="span">
            {formatMoney(invoice.amount)}
          </Typography>
        </div>
      </div>

      {difference === 0 ? (
        <Typography type="body-sm" className="flex items-center gap-2 text-success" data-testid="invoice-amount-match">
          <CircleCheck aria-hidden className="size-4" />
          <FormattedMessage id="invoice.amountMatches" />
        </Typography>
      ) : (
        <Alert status="warning" data-testid="invoice-amount-mismatch">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              <FormattedMessage
                id="invoice.amountMismatch.title"
                values={{
                  direction: difference < 0 ? 'lower' : 'higher',
                  difference: formatCents(Math.abs(difference)),
                }}
              />
            </Alert.Title>
            <Alert.Description>
              <FormattedMessage id="invoice.amountMismatch.description" />
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
    </div>
  )
}
