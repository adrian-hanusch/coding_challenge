import { Card, cn } from '@heroui/react'
import { type ReactNode, useId } from 'react'
import { FormattedMessage } from 'react-intl'

import { Typography } from '../Typography.tsx'
import { StepMarker, type StepStatus } from './StepMarker.tsx'

interface StepSectionProps {
  step: number
  status: StepStatus
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  'data-testid'?: string
}

export function StepSection({
  step,
  status,
  title,
  description,
  action,
  children,
  'data-testid': testId,
}: StepSectionProps) {
  const titleId = useId()

  return (
    <li aria-current={status === 'current' ? 'step' : undefined} data-step-status={status} data-testid={testId}>
      <Card className={cn('p-6 sm:p-8', status === 'current' && 'ring-2 ring-accent')}>
        <section aria-labelledby={titleId} className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            <StepMarker step={step} status={status} />
            <div className="flex min-w-48 flex-1 flex-col gap-1">
              <Typography type="h5" id={titleId} elementType="h2">
                {title}
                <span className="sr-only">
                  {' – '}
                  <FormattedMessage id="steps.status" values={{ status }} />
                </span>
              </Typography>
              {description ? (
                <Typography type="body-sm" color="muted">
                  {description}
                </Typography>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
          {children}
        </section>
      </Card>
    </li>
  )
}
