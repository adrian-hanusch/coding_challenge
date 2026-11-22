import { useId } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Invoice, Payment } from '../../../api/types.ts'
import { SectionHeader } from '../../../components/SectionHeader.tsx'
import { InvoiceSearchField } from './invoice-search/InvoiceSearchField.tsx'
import { SelectedInvoice } from './SelectedInvoice.tsx'

interface InvoiceSelectionProps {
  payment: Payment
  invoice: Invoice | null
  onInvoiceChange: (invoice: Invoice | null) => void
}

export function InvoiceSelection({ payment, invoice, onInvoiceChange }: InvoiceSelectionProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-5" data-testid="invoice-selection">
      <SectionHeader
        id={titleId}
        title={<FormattedMessage id="paymentDetails.invoice.title" />}
        description={<FormattedMessage id="paymentDetails.invoice.description" />}
      />
      <InvoiceSearchField
        customerId={payment.customerId}
        senderName={payment.senderName}
        invoice={invoice}
        onInvoiceChange={onInvoiceChange}
      />
      {invoice ? <SelectedInvoice invoice={invoice} paymentAmount={payment.amount} /> : null}
    </section>
  )
}
