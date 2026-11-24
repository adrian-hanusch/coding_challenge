import { Link } from '@heroui/react'
import { ArrowLeftRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Invoice, Payment } from '../../api/types.ts'
import { PATHS } from '../../app/paths.ts'
import { AssignmentResult } from './confirmation/AssignmentResult.tsx'
import { ConfirmAssignment } from './confirmation/ConfirmAssignment.tsx'
import { useAssignPayment } from './confirmation/useAssignPayment.ts'
import { FeeSplitter } from './fee-splitter/FeeSplitter.tsx'
import { useSplitDraft } from './fee-splitter/useSplitDraft.ts'
import { AssignedNotice } from './invoice/AssignedNotice.tsx'
import { InvoiceSelection } from './invoice/InvoiceSelection.tsx'
import { PaymentOverview } from './payment/PaymentOverview.tsx'
import { AssignmentSteps, type StepState } from './steps/AssignmentSteps.tsx'

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

  if (assign.data) {
    return <AssignmentResult payment={payment} invoice={assign.variables.invoice} assignment={assign.data} />
  }

  const isAssigned = payment.status === 'ASSIGNED'

  const invoiceStep: StepState = isAssigned
    ? { status: 'done', content: <AssignedNotice ref={assignedNoticeRef} /> }
    : {
        status: invoice ? 'done' : 'current',
        description: <FormattedMessage id="paymentDetails.invoice.description" />,
        content: <InvoiceSelection payment={payment} invoice={invoice} onInvoiceChange={setInvoice} />,
      }
  const splitStep: StepState = invoice
    ? {
        status: split.evaluation.validSplit ? 'done' : 'current',
        description: <FormattedMessage id="feeSplit.description" />,
        content: <FeeSplitter paymentAmount={payment.amount} split={split} />,
      }
    : { status: 'locked' }

  return (
    <>
      <AssignmentSteps
        payment={{
          status: 'done',
          content: <PaymentOverview payment={payment} />,
          action: (
            <Link href={PATHS.selectPayment} className="gap-1.5 text-sm" data-testid="change-payment">
              <ArrowLeftRight aria-hidden className="size-4" />
              <FormattedMessage id="steps.payment.change" />
            </Link>
          ),
        }}
        invoice={invoiceStep}
        split={isEditable ? splitStep : undefined}
      />

      {isEditable ? (
        <ConfirmAssignment
          payment={payment}
          invoice={invoice}
          split={split.evaluation}
          assign={assign}
          isConfirming={isConfirming}
          onConfirmingChange={setIsConfirming}
          onInvoiceRejected={() => setInvoice(null)}
        />
      ) : null}
    </>
  )
}
