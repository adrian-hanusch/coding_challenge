import { useEffect, useRef, useState } from 'react'

import type { Invoice, Payment } from '../../api/types.ts'
import { AssignmentResult } from './confirmation/AssignmentResult.tsx'
import { ConfirmAssignmentBar } from './confirmation/ConfirmAssignmentBar.tsx'
import { useAssignPayment } from './confirmation/useAssignPayment.ts'
import { FeeSplitter } from './fee-splitter/FeeSplitter.tsx'
import { useSplitDraft } from './fee-splitter/useSplitDraft.ts'
import { AssignedNotice } from './invoice/AssignedNotice.tsx'
import { InvoiceSelection } from './invoice/InvoiceSelection.tsx'
import { PaymentCard } from './payment/PaymentCard.tsx'
import { PaymentOverview } from './payment/PaymentOverview.tsx'

export function PaymentAssignment({ payment }: { payment: Payment }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const split = useSplitDraft(payment.amount)
  const assign = useAssignPayment(payment)
  // A refetch that finds the payment assigned must not pull the open dialog away; submitting then reports it.
  const isEditable = payment.status === 'UNMATCHED' || isConfirming
  const assignedNoticeRef = useRef<HTMLDivElement>(null)
  const wasEditable = useRef(isEditable)

  // The form and the dialog's trigger just unmounted, so focus would otherwise fall back to the page body.
  useEffect(() => {
    if (wasEditable.current && !isEditable) assignedNoticeRef.current?.focus()
    wasEditable.current = isEditable
  }, [isEditable])

  return (
    <>
      <PaymentCard data-testid="payment-details">
        <PaymentOverview payment={payment} />
        {/* After a confirmation here, the result card below takes over the invoice section. */}
        {assign.data ? null : payment.status === 'ASSIGNED' ? (
          <AssignedNotice ref={assignedNoticeRef} />
        ) : (
          <InvoiceSelection payment={payment} invoice={invoice} onInvoiceChange={setInvoice} />
        )}
      </PaymentCard>

      {assign.data ? (
        <AssignmentResult payment={payment} invoice={assign.variables.invoice} assignment={assign.data} />
      ) : isEditable ? (
        <>
          <FeeSplitter paymentAmount={payment.amount} split={split} />
          <ConfirmAssignmentBar
            payment={payment}
            invoice={invoice}
            split={split.evaluation}
            assign={assign}
            isConfirming={isConfirming}
            onConfirmingChange={setIsConfirming}
            onInvoiceRejected={() => setInvoice(null)}
          />
        </>
      ) : null}
    </>
  )
}
