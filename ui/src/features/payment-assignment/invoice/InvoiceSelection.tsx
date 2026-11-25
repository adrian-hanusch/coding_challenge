import { useEffect, useId, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import type { Invoice, Payment } from '../../../api/types.ts'
import { Notice } from '../../../components/Notice.tsx'
import { invoiceDifference } from '../../../domain/invoice.ts'
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
  const shouldFocusSelection = useRef(false)
  const selectionRef = useRef<HTMLDivElement>(null)
  const invoiceId = invoice?.id

  useEffect(() => {
    if (invoiceId && shouldFocusSelection.current) selectionRef.current?.focus()
    shouldFocusSelection.current = false
  }, [invoiceId])

  function select(next: Invoice, wasFocused: boolean) {
    shouldFocusSelection.current = wasFocused
    onSelect(next)
  }

  if (!invoice) {
    return (
      <InvoiceSearchField
        customerId={payment.customerId}
        senderName={payment.senderName}
        start={search}
        onSelect={select}
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
