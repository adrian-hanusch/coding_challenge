import { useState } from 'react'
import type { Invoice, Payment } from '../../api/types.ts'
import { FeeSplitter } from './fee-splitter/FeeSplitter.tsx'
import { PaymentDetailsForm } from './payment-details/PaymentDetailsForm.tsx'
import { useSplitDraft } from './fee-splitter/useSplitDraft.ts'

/** Everything the user enters to assign a loaded payment: the invoice and the split. */
export function AssignmentForm({ payment }: { payment: Payment }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const split = useSplitDraft(payment.amount)

  return (
    <>
      <PaymentDetailsForm payment={payment} invoice={invoice} onInvoiceChange={setInvoice} />
      {payment.status === 'UNMATCHED' ? <FeeSplitter paymentAmount={payment.amount} split={split} /> : null}
    </>
  )
}
