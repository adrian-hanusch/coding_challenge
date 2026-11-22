import { FormattedMessage } from 'react-intl'

import type { Invoice, Money } from '../../../api/types.ts'
import { SuccessNote } from '../../../components/SuccessNote.tsx'
import { Typography } from '../../../components/Typography.tsx'
import { invoiceDifference } from '../../../domain/invoice.ts'
import { useFormatMoney } from '../../../lib/useFormatMoney.ts'
import { InvoiceDueDate } from '../invoice/InvoiceDueDate.tsx'
import { InvoiceMismatchAlert } from '../invoice/InvoiceMismatchAlert.tsx'

/** Chosen invoice and its difference to the payment. */
export function SelectedInvoice({ invoice, paymentAmount }: { invoice: Invoice; paymentAmount: Money }) {
  const formatMoney = useFormatMoney()
  const difference = invoiceDifference(paymentAmount, invoice)

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
        <SuccessNote data-testid="invoice-amount-match">
          <FormattedMessage id="invoice.amountMatches" />
        </SuccessNote>
      ) : (
        <InvoiceMismatchAlert
          difference={difference}
          currency={paymentAmount.currency}
          data-testid="invoice-amount-mismatch"
        >
          <FormattedMessage id="invoice.amountMismatch.description" />
        </InvoiceMismatchAlert>
      )}
    </div>
  )
}
