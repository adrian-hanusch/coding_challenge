import type { ReactNode } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepSection } from '../../../components/steps/StepSection.tsx'
import { Typography } from '../../../components/Typography.tsx'

interface OpenStep {
  status: 'done' | 'current'
  content: ReactNode
  description?: ReactNode
  action?: ReactNode
}

interface LockedStep {
  status: 'locked'
  /** Replaces the default hint on what has to happen first. */
  hint?: ReactNode
}

export type StepState = OpenStep | LockedStep

interface AssignmentStepsProps {
  payment: OpenStep
  invoice: StepState
  /** Hidden when omitted. */
  split?: StepState
}

export function AssignmentSteps({ payment, invoice, split }: AssignmentStepsProps) {
  const intl = useIntl()

  return (
    <ol aria-label={intl.formatMessage({ id: 'steps.label' })} className="flex flex-col gap-6">
      <StepSection
        step={1}
        status={payment.status}
        title={<FormattedMessage id="steps.payment.title" />}
        description={payment.description}
        action={payment.action}
        data-testid="step-payment"
      >
        {payment.content}
      </StepSection>
      <LockableStep
        step={2}
        state={invoice}
        title={<FormattedMessage id="paymentDetails.invoice.title" />}
        lockedHint={<FormattedMessage id="steps.invoice.locked" />}
        data-testid="step-invoice"
      />
      {split ? (
        <LockableStep
          step={3}
          state={split}
          title={<FormattedMessage id="feeSplit.title" />}
          lockedHint={<FormattedMessage id="steps.split.locked" />}
          data-testid="step-split"
        />
      ) : null}
    </ol>
  )
}

interface LockableStepProps {
  step: number
  state: StepState
  title: ReactNode
  lockedHint: ReactNode
  'data-testid': string
}

function LockableStep({ state, lockedHint, ...section }: LockableStepProps) {
  if (state.status === 'locked') {
    return (
      <StepSection {...section} status="locked">
        <Typography type="body-sm" color="muted" data-testid="step-locked-hint">
          {state.hint ?? lockedHint}
        </Typography>
      </StepSection>
    )
  }
  const { content, ...open } = state
  return (
    <StepSection {...section} {...open}>
      {content}
    </StepSection>
  )
}
