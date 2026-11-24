import type { Invoice, Payment } from '../../../api/types.ts'
import { InvoiceSearchField } from './search/InvoiceSearchField.tsx'
import { SelectedInvoice } from './SelectedInvoice.tsx'

interface InvoiceSelectionProps {
  payment: Payment
  invoice: Invoice | null
  onInvoiceChange: (invoice: Invoice | null) => void
}

export function InvoiceSelection({ payment, invoice, onInvoiceChange }: InvoiceSelectionProps) {
  return (
    <div className="flex flex-col gap-5" data-testid="invoice-selection">
      <InvoiceSearchField
        customerId={payment.customerId}
        senderName={payment.senderName}
        invoice={invoice}
        onInvoiceChange={onInvoiceChange}
      />
      {invoice ? <SelectedInvoice invoice={invoice} paymentAmount={payment.amount} /> : null}
    </div>
  )
}
