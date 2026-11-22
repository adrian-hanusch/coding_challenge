import { Button, Modal } from '@heroui/react'
import { FormattedMessage } from 'react-intl'

import type { Invoice, Payment } from '../../../api/types.ts'
import { SuccessNote } from '../../../components/SuccessNote.tsx'
import { Typography } from '../../../components/Typography.tsx'
import { type AssignmentBlocker, assignmentBlockers } from '../../../domain/assignment.ts'
import type { SplitEvaluation } from '../../../domain/split.ts'
import { isInvoiceRejected } from './assignmentFailure.ts'
import { ConfirmAssignmentDialog } from './ConfirmAssignmentDialog.tsx'
import type { AssignPaymentMutation } from './useAssignPayment.ts'

interface ConfirmAssignmentBarProps {
  payment: Payment
  invoice: Invoice | null
  split: SplitEvaluation
  assign: AssignPaymentMutation
  isConfirming: boolean
  onConfirmingChange: (isConfirming: boolean) => void
  /** Called when the server rejected the selected invoice and the dialog is closed. */
  onInvoiceRejected: () => void
}

export function ConfirmAssignmentBar({
  payment,
  invoice,
  split,
  assign,
  isConfirming,
  onConfirmingChange,
  onInvoiceRejected,
}: ConfirmAssignmentBarProps) {
  const blockers = assignmentBlockers(invoice, split)

  function changeConfirming(isOpen: boolean) {
    if (assign.isPending) return
    onConfirmingChange(isOpen)
    if (isOpen) return
    // Cleared only on close: clearing while open would unmount the dialog together with its error message.
    if (assign.error && isInvoiceRejected(assign.error)) onInvoiceRejected()
    // An error belongs to the last attempt and should not greet the next opening.
    assign.reset()
  }

  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="confirm-assignment"
    >
      <Readiness blockers={blockers} />
      <Modal isOpen={isConfirming} onOpenChange={changeConfirming}>
        <Button isDisabled={blockers.length > 0} className="w-full shrink-0 sm:w-auto" data-testid="confirm-open">
          <FormattedMessage id="confirm.open" />
        </Button>
        {invoice && split.validSplit ? (
          <ConfirmAssignmentDialog payment={payment} invoice={invoice} split={split.validSplit} assign={assign} />
        ) : null}
      </Modal>
    </div>
  )
}

/** What is still missing, so the disabled button is never left unexplained. */
function Readiness({ blockers }: { blockers: AssignmentBlocker[] }) {
  if (blockers.length === 0) {
    return (
      <SuccessNote data-testid="confirm-ready">
        <FormattedMessage id="confirm.ready" />
      </SuccessNote>
    )
  }

  return (
    <div className="flex flex-col gap-1" data-testid="confirm-blockers">
      <Typography type="body-sm" weight="medium">
        <FormattedMessage id="confirm.blockers.title" />
      </Typography>
      <ul className="list-disc ps-5 text-sm text-muted">
        {blockers.map((blocker) => (
          <li key={blocker}>
            <FormattedMessage id="confirm.blocker" values={{ blocker }} />
          </li>
        ))}
      </ul>
    </div>
  )
}
