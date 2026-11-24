import { Button, Modal } from '@heroui/react'
import { type ReactNode, useState } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Invoice, Payment } from '../../../api/types.ts'
import { Detail, DetailList } from '../../../components/Detail.tsx'
import { Typography } from '../../../components/Typography.tsx'
import { invoiceDifference } from '../../../domain/invoice.ts'
import type { CompleteSplit } from '../../../domain/split.ts'
import { useFormatDateTime, useFormatPlainDate } from '../../../lib/useFormatDate.ts'
import { useFormatMoney } from '../../../lib/useFormatMoney.ts'
import { MismatchAcknowledgement } from '../invoice/MismatchAcknowledgement.tsx'
import { AssignmentErrorAlert } from './AssignmentErrorAlert.tsx'
import { isRetryable } from './assignmentFailure.ts'
import { SplitBreakdown } from './SplitBreakdown.tsx'
import type { AssignPaymentMutation } from './useAssignPayment.ts'

interface DialogContentProps {
  payment: Payment
  invoice: Invoice
  split: CompleteSplit
  assign: AssignPaymentMutation
}

interface ConfirmAssignmentDialogProps extends DialogContentProps {
  isOpen: boolean
  onClose: () => void
}

export function ConfirmAssignmentDialog({ isOpen, onClose, ...content }: ConfirmAssignmentDialogProps) {
  const isPending = content.assign.isPending

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

function DialogContent({ payment, invoice, split, assign }: DialogContentProps) {
  const formatDateTime = useFormatDateTime()
  const formatPlainDate = useFormatPlainDate()
  const formatMoney = useFormatMoney()
  const difference = invoiceDifference(payment.amount, invoice)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [hasTriedConfirm, setHasTriedConfirm] = useState(false)

  function confirm() {
    setHasTriedConfirm(true)
    if (difference === 0 || isAcknowledged) assign.mutate({ invoice, split })
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
        <SummarySection title={<FormattedMessage id="confirm.section.payment" />} data-testid="confirm-payment">
          <DetailList columns={2} className="rounded-2xl bg-surface-secondary p-4">
            <Detail label={<FormattedMessage id="paymentDetails.amount" />} data-testid="confirm-payment-amount">
              <span className="tabular-nums">{formatMoney(payment.amount)}</span>
            </Detail>
            <Detail label={<FormattedMessage id="paymentDetails.receivedAt" />} data-testid="confirm-received-at">
              {formatDateTime(payment.receivedAt)}
            </Detail>
            <Detail label={<FormattedMessage id="paymentDetails.sender" />} data-testid="confirm-sender">
              {payment.senderName}
            </Detail>
            <Detail label={<FormattedMessage id="paymentDetails.reference" />} data-testid="confirm-reference">
              <span className="font-mono break-all">{payment.referenceNumber}</span>
            </Detail>
          </DetailList>
        </SummarySection>

        <SummarySection title={<FormattedMessage id="confirm.section.invoice" />} data-testid="confirm-invoice">
          <DetailList columns={2} className="rounded-2xl bg-surface-secondary p-4">
            <Detail label={<FormattedMessage id="invoice.amount" />} data-testid="confirm-invoice-amount">
              <span className="tabular-nums">{formatMoney(invoice.amount)}</span>
            </Detail>
            <Detail label={<FormattedMessage id="confirm.dueDate" />} data-testid="confirm-due-date">
              {formatPlainDate(invoice.dueDate)}
            </Detail>
            <Detail label={<FormattedMessage id="confirm.invoiceNumber" />} data-testid="confirm-invoice-number">
              <span className="tabular-nums">{invoice.invoiceNumber}</span>
            </Detail>
            <Detail label={<FormattedMessage id="confirm.merchant" />} data-testid="confirm-merchant">
              {invoice.merchant.name}
            </Detail>
          </DetailList>
          {difference === 0 ? null : (
            <MismatchAcknowledgement
              currency={payment.amount.currency}
              difference={difference}
              isAcknowledged={isAcknowledged}
              showError={hasTriedConfirm && !isAcknowledged}
              isDisabled={assign.isPending}
              onChange={setIsAcknowledged}
            />
          )}
        </SummarySection>

        <SummarySection title={<FormattedMessage id="confirm.section.split" />} data-testid="confirm-split">
          <SplitBreakdown paymentAmount={payment.amount} split={split} />
        </SummarySection>

        {assign.error ? <AssignmentErrorAlert error={assign.error} /> : null}
      </Modal.Body>

      <Modal.Footer className="flex-col-reverse sm:flex-row">
        <Button slot="close" variant="secondary" isDisabled={assign.isPending} className="w-full sm:w-auto">
          <FormattedMessage id="confirm.cancel" />
        </Button>
        <Button
          isPending={assign.isPending}
          isDisabled={assign.error ? !isRetryable(assign.error) : false}
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
      <Typography type="body-sm" weight="semibold" elementType="h3">
        {title}
      </Typography>
      {children}
    </section>
  )
}
