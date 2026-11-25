import { Button } from '@heroui/react'
import { useEffect, useId, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { Navigate, useNavigate } from 'react-router'

import type { Invoice, Payment } from '../../api/types.ts'
import { AFTER_ASSIGNMENT, CHANGE_PAYMENT, PATHS } from '../../app/paths.ts'
import { Page } from '../../components/Page.tsx'
import { ConfirmAssignment } from './confirmation/ConfirmAssignment.tsx'
import { useAssignPayment } from './confirmation/useAssignPayment.ts'
import { FeeSplitter } from './fee-splitter/FeeSplitter.tsx'
import { useSplitDraft } from './fee-splitter/useSplitDraft.ts'
import { AssignedNotice } from './invoice/AssignedNotice.tsx'
import { InvoiceSelection } from './invoice/InvoiceSelection.tsx'
import type { InvoiceSearchStart } from './invoice/search/InvoiceSearchField.tsx'
import { PaymentSummary } from './payment/PaymentSummary.tsx'
import { AssignmentSteps, type StepState } from './steps/AssignmentSteps.tsx'

interface InvoiceChoice {
  invoice: Invoice | null
  /** How the search field starts while no invoice is chosen. */
  search: InvoiceSearchStart
}

const EMPTY_SEARCH: InvoiceSearchStart = { text: '', autoFocus: false }

export function PaymentAssignment({ payment }: { payment: Payment }) {
  const navigate = useNavigate()
  const zeroHintId = useId()
  const [{ invoice, search }, setInvoiceChoice] = useState<InvoiceChoice>({ invoice: null, search: EMPTY_SEARCH })
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

  if (assign.isSuccess) return <Navigate to={PATHS.selectPayment} state={AFTER_ASSIGNMENT} replace />

  const isAssigned = payment.status === 'ASSIGNED'

  const invoiceStep: StepState = isAssigned
    ? { status: 'done', content: <AssignedNotice ref={assignedNoticeRef} /> }
    : {
        status: invoice ? 'done' : 'current',
        description: invoice ? undefined : <FormattedMessage id="paymentDetails.invoice.description" />,
        content: (
          <InvoiceSelection
            payment={payment}
            invoice={invoice}
            search={search}
            onSelect={(next) => {
              setInvoiceChoice({ invoice: next, search: EMPTY_SEARCH })
            }}
          />
        ),
        action: invoice ? (
          <Button
            variant="secondary"
            size="sm"
            onPress={() => {
              setInvoiceChoice({ invoice: null, search: { text: '', autoFocus: true } })
            }}
            data-testid="change-invoice"
          >
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
            <Button
              variant="secondary"
              size="sm"
              onPress={() => void navigate(PATHS.selectPayment, { state: CHANGE_PAYMENT })}
              data-testid="change-payment"
            >
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
          assign={assign}
          isConfirming={isConfirming}
          onConfirmingChange={setIsConfirming}
          onInvoiceRejected={() => {
            // Keeps the number visible, so the user knows which invoice was rejected.
            setInvoiceChoice({ invoice: null, search: { text: invoice?.invoiceNumber ?? '', autoFocus: false } })
          }}
        />
      ) : null}
    </Page>
  )
}
