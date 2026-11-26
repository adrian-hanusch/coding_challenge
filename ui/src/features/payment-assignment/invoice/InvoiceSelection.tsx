import { useId, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import type { Invoice, Payment } from '../../../api/types.ts'
import { Notice } from '../../../components/Notice.tsx'
import { invoiceDifference } from '../../../domain/invoice.ts'
import { useFocusWhen } from '../../../lib/useFocusWhen.ts'
import { InvoiceMismatchAlert } from './InvoiceMismatchAlert.tsx'
import { InvoiceSummary } from './InvoiceSummary.tsx'
import { InvoiceSearchField, type InvoiceSearchStart } from './search/InvoiceSearchField.tsx'

interface InvoiceSelectionProps {
  payment: Payment
  invoice: Invoice | null
  search: InvoiceSearchStart
  onSelect: (invoice: Invoice) => void
}

export function InvoiceSelection({ payment, invoice, search, onSelect }: InvoiceSelectionProps) {
  const intl = useIntl()
  const alertId = useId()
  const selectionRef = useRef<HTMLDivElement>(null)

  // The search field unmounts with the selection, so focus would otherwise fall back to the page body.
  useFocusWhen(selectionRef, invoice?.id)

  if (!invoice) {
    return (
      <InvoiceSearchField
        customerId={payment.customerId}
        senderName={payment.senderName}
        start={search}
        onSelect={onSelect}
      />
    )
  }

  const difference = invoiceDifference(payment.amount, invoice)

  return (
    <div
      ref={selectionRef}
      tabIndex={-1}
      role="group"
      aria-label={intl.formatMessage(
        { id: 'invoice.selected' },
        { number: invoice.invoiceNumber, merchant: invoice.merchant.name },
      )}
      aria-describedby={alertId}
      className="flex flex-col gap-3 outline-none"
      data-testid="invoice-selection"
    >
      <InvoiceSummary invoice={invoice} />
      <div id={alertId}>
        {difference === 0 ? (
          <Notice
            status="success"
            title={<FormattedMessage id="invoice.amountMatches" />}
            data-testid="invoice-amount-match"
          />
        ) : (
          <InvoiceMismatchAlert
            difference={difference}
            currency={payment.amount.currency}
            data-testid="invoice-amount-mismatch"
          >
            <FormattedMessage id="invoice.amountMismatch.description" />
          </InvoiceMismatchAlert>
        )}
      </div>
    </div>
  )
}
