import { Button } from '@heroui/react'
import { useId, useRef } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Payment } from '../../api/types.ts'
import { Page } from '../../components/Page.tsx'
import { useFocusWhen } from '../../lib/useFocusWhen.ts'
import { ConfirmAssignment } from './confirmation/ConfirmAssignment.tsx'
import { FeeSplitter } from './fee-splitter/FeeSplitter.tsx'
import { AssignedNotice } from './invoice/AssignedNotice.tsx'
import { InvoiceSelection } from './invoice/InvoiceSelection.tsx'
import { PaymentSummary } from './payment/PaymentSummary.tsx'
import { AssignmentSteps, type StepState } from './steps/AssignmentSteps.tsx'
import { useAssignmentFlow } from './useAssignmentFlow.ts'

interface PaymentAssignmentProps {
  payment: Payment
  onChangePayment: () => void
  /** Called once the assignment is stored. */
  onAssigned: () => void
}

export function PaymentAssignment({ payment, onChangePayment, onAssigned }: PaymentAssignmentProps) {
  const zeroHintId = useId()
  const flow = useAssignmentFlow(payment, onAssigned)
  const { invoice, split, isEditable } = flow
  const assignedNoticeRef = useRef<HTMLDivElement>(null)

  // The form and the dialog's trigger just unmounted, so focus would otherwise fall back to the page body.
  useFocusWhen(assignedNoticeRef, !isEditable)

  if (flow.isAssigned) return null

  const invoiceStep: StepState =
    payment.status === 'ASSIGNED'
      ? { status: 'done', content: <AssignedNotice ref={assignedNoticeRef} /> }
      : {
          status: invoice ? 'done' : 'current',
          description: invoice ? undefined : <FormattedMessage id="paymentDetails.invoice.description" />,
          content: (
            <InvoiceSelection
              payment={payment}
              invoice={invoice}
              search={flow.invoiceSearch}
              onSelect={flow.selectInvoice}
            />
          ),
          action: invoice ? (
            <Button variant="secondary" size="sm" onPress={flow.changeInvoice} data-testid="change-invoice">
              <FormattedMessage id="steps.invoice.change" />
            </Button>
          ) : undefined,
        }
  const splitStep: StepState = invoice
    ? {
        status: split.evaluation.validSplit ? 'done' : 'current',
        description: (
          <>
            <FormattedMessage id="feeSplit.description" />{' '}
            <span id={zeroHintId}>
              <FormattedMessage id="feeSplit.zeroHint" />
            </span>
          </>
        ),
        content: <FeeSplitter paymentAmount={payment.amount} split={split} zeroHintId={zeroHintId} />,
      }
    : { status: 'locked' }

  return (
    <Page title={<FormattedMessage id={isEditable ? 'assign.title' : 'assign.assignedTitle'} />}>
      <AssignmentSteps
        payment={{
          status: 'done',
          content: <PaymentSummary payment={payment} />,
          action: (
            <Button variant="secondary" size="sm" onPress={onChangePayment} data-testid="change-payment">
              <FormattedMessage id={isEditable ? 'steps.payment.change' : 'steps.payment.chooseOther'} />
            </Button>
          ),
        }}
        invoice={invoiceStep}
        isReadOnly={!isEditable}
        split={splitStep}
      />

      {isEditable ? (
        <ConfirmAssignment
          payment={payment}
          invoice={invoice}
          split={split.evaluation}
          submission={flow.submission}
          isConfirming={flow.isConfirming}
          onConfirmingChange={flow.setIsConfirming}
          onInvoiceRejected={flow.rejectInvoice}
        />
      ) : null}
    </Page>
  )
}
