import { FormattedMessage } from 'react-intl'

import type { Invoice, Payment } from '../../../api/types.ts'
import { BlockableButton } from '../../../components/BlockableButton.tsx'
import { type AssignmentBlocker, assignmentBlockers } from '../../../domain/assignment.ts'
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
  onInvoiceRejected,
}: ConfirmAssignmentProps) {
  const { validSplit } = split
  const blockers = assignmentBlockers(invoice, split)

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
      <BlockableButton
        blockedReason={blockers.length > 0 ? <BlockerList blockers={blockers} /> : null}
        onPress={() => {
          onConfirmingChange(true)
        }}
        className="w-full sm:w-auto"
        data-testid="confirm-open"
      >
        <FormattedMessage id="confirm.open" />
      </BlockableButton>
      {invoice && validSplit ? (
        <ConfirmAssignmentDialog
          isOpen={isConfirming}
          onClose={close}
          payment={payment}
          invoice={invoice}
          split={validSplit}
          isPending={submission.isPending}
          error={submission.error}
          onSubmit={() => {
            submission.submit({ invoice, split: validSplit })
          }}
        />
      ) : null}
    </div>
  )
}

function BlockerList({ blockers }: { blockers: AssignmentBlocker[] }) {
  if (blockers.length === 1) return <FormattedMessage id="confirm.blocker" values={{ blocker: blockers[0] }} />
  return (
    <ul className="flex list-disc flex-col gap-1 ps-4">
      {blockers.map((blocker) => (
        <li key={blocker}>
          <FormattedMessage id="confirm.blocker" values={{ blocker }} />
        </li>
      ))}
    </ul>
  )
}
