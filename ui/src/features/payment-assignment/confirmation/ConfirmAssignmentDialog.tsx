import { Button, Modal } from '@heroui/react'
import { type ReactNode, useState } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Invoice, Payment } from '../../../api/types.ts'
import { Typography } from '../../../components/Typography.tsx'
import { invoiceDifference } from '../../../domain/invoice.ts'
import type { CompleteSplit } from '../../../domain/split.ts'
import { InvoiceSummary } from '../invoice/InvoiceSummary.tsx'
import { MismatchAcknowledgement } from '../invoice/MismatchAcknowledgement.tsx'
import { PaymentSummary } from '../payment/PaymentSummary.tsx'
import { AssignmentErrorAlert } from './AssignmentErrorAlert.tsx'
import { isRetryable } from './assignmentFailure.ts'
import { SplitBreakdown } from './SplitBreakdown.tsx'

interface DialogContentProps {
  payment: Payment
  invoice: Invoice
  split: CompleteSplit
  isPending: boolean
  /** Of the last attempt. */
  error: Error | null
  onSubmit: () => void
}

interface ConfirmAssignmentDialogProps extends DialogContentProps {
  isOpen: boolean
  onClose: () => void
}

export function ConfirmAssignmentDialog({ isOpen, onClose, ...content }: ConfirmAssignmentDialogProps) {
  const { isPending } = content

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={onClose}
      isDismissable={!isPending}
      isKeyboardDismissDisabled={isPending}
    >
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog data-testid="confirm-assignment-dialog">
          <Modal.CloseTrigger isDisabled={isPending} />
          {/* The dialog unmounts its content when it closes, so each opening starts unacknowledged. */}
          <DialogContent {...content} />
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function DialogContent({ payment, invoice, split, isPending, error, onSubmit }: DialogContentProps) {
  const difference = invoiceDifference(payment.amount, invoice)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [hasTriedConfirm, setHasTriedConfirm] = useState(false)

  function confirm() {
    setHasTriedConfirm(true)
    if (difference === 0 || isAcknowledged) onSubmit()
  }

  return (
    <>
      <Modal.Header>
        <Modal.Heading>
          <FormattedMessage id="confirm.title" />
        </Modal.Heading>
        <Typography type="body-sm" color="muted">
          <FormattedMessage id="confirm.description" />
        </Typography>
      </Modal.Header>

      <Modal.Body className="flex flex-col gap-6">
        <SummarySection title={<FormattedMessage id="confirm.section.split" />} data-testid="confirm-split">
          <SplitBreakdown paymentAmount={payment.amount} split={split} />
        </SummarySection>

        <SummarySection title={<FormattedMessage id="confirm.section.payment" />} data-testid="confirm-payment">
          <PaymentSummary payment={payment} />
        </SummarySection>

        <SummarySection title={<FormattedMessage id="confirm.section.invoice" />} data-testid="confirm-invoice">
          <InvoiceSummary invoice={invoice} />
          {difference === 0 ? null : (
            <MismatchAcknowledgement
              currency={payment.amount.currency}
              difference={difference}
              isAcknowledged={isAcknowledged}
              showError={hasTriedConfirm && !isAcknowledged}
              isDisabled={isPending}
              onChange={setIsAcknowledged}
            />
          )}
        </SummarySection>

        {error ? <AssignmentErrorAlert error={error} /> : null}
      </Modal.Body>

      <Modal.Footer className="flex-col-reverse sm:flex-row">
        <Button slot="close" variant="tertiary" isDisabled={isPending} className="w-full sm:w-auto">
          <FormattedMessage id="confirm.cancel" />
        </Button>
        <Button
          isPending={isPending}
          isDisabled={error ? !isRetryable(error) : false}
          onPress={confirm}
          className="w-full sm:w-auto"
          data-testid="confirm-submit"
        >
          <FormattedMessage id="confirm.submit" />
        </Button>
      </Modal.Footer>
    </>
  )
}

function SummarySection({
  title,
  children,
  'data-testid': testId,
}: {
  title: ReactNode
  children: ReactNode
  'data-testid': string
}) {
  return (
    <section className="flex flex-col gap-3" data-testid={testId}>
      <Typography type="h6" elementType="h3">
        {title}
      </Typography>
      {children}
    </section>
  )
}
