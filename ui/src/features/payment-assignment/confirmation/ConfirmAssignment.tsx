import { Button } from '@heroui/react'
import { FormattedMessage } from 'react-intl'

import type { Invoice, Payment } from '../../../api/types.ts'
import type { SplitEvaluation } from '../../../domain/split.ts'
import { isInvoiceRejected } from './assignmentFailure.ts'
import { ConfirmAssignmentDialog } from './ConfirmAssignmentDialog.tsx'
import type { AssignmentSubmission } from './useAssignPayment.ts'

interface ConfirmAssignmentProps {
  payment: Payment
  invoice: Invoice | null
  split: SplitEvaluation
  submission: AssignmentSubmission
  isConfirming: boolean
  onConfirmingChange: (isConfirming: boolean) => void
  /** Called on a press while input is missing, instead of opening the dialog. */
  onIncomplete: () => void
  /** Called when the server rejected the selected invoice and the dialog is closed. */
  onInvoiceRejected: () => void
}

export function ConfirmAssignment({
  payment,
  invoice,
  split,
  submission,
  isConfirming,
  onConfirmingChange,
  onIncomplete,
  onInvoiceRejected,
}: ConfirmAssignmentProps) {
  const ready = invoice && split.validSplit ? { invoice, split: split.validSplit } : null

  function close() {
    if (submission.isPending) return
    onConfirmingChange(false)
    // Cleared only on close: clearing while open would unmount the dialog together with its error message.
    if (submission.error && isInvoiceRejected(submission.error)) onInvoiceRejected()
    // An error belongs to the last attempt and should not greet the next opening.
    submission.reset()
  }

  return (
    <div className="flex justify-end" data-testid="confirm-assignment">
      <Button
        onPress={() => {
          if (ready) onConfirmingChange(true)
          else onIncomplete()
        }}
        className="w-full sm:w-auto"
        data-testid="confirm-open"
      >
        <FormattedMessage id="confirm.open" />
      </Button>
      {ready ? (
        <ConfirmAssignmentDialog
          isOpen={isConfirming}
          onClose={close}
          payment={payment}
          invoice={ready.invoice}
          split={ready.split}
          isPending={submission.isPending}
          error={submission.error}
          onSubmit={() => {
            submission.submit(ready)
          }}
        />
      ) : null}
    </div>
  )
}
