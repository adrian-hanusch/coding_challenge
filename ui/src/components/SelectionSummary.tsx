import { cn, Surface } from '@heroui/react'
import type { ReactNode } from 'react'

import { Typography } from './Typography.tsx'

interface LabeledValue {
  label: ReactNode
  value: ReactNode
}

interface SelectionSummaryProps {
  title: LabeledValue
  amount: LabeledValue
  reference: LabeledValue
  date: LabeledValue
  'data-testid'?: string
}

/** A chosen payment or invoice, arranged like its entry in the search results. */
export function SelectionSummary({ title, amount, reference, date, 'data-testid': testId }: SelectionSummaryProps) {
  return (
    <Surface variant="secondary" className="rounded-field p-4" data-testid={testId}>
      <dl className="grid grid-cols-[minmax(0,1fr)_fit-content(50%)] gap-x-6 gap-y-4">
        <Detail label={title.label} type="h6">
          {title.value}
        </Detail>
        <Detail label={amount.label} type="h3" align="end">
          {amount.value}
        </Detail>
        <Detail label={reference.label}>{reference.value}</Detail>
        <Detail label={date.label} align="end">
          {date.value}
        </Detail>
      </dl>
    </Surface>
  )
}

interface DetailProps {
  label: ReactNode
  children: ReactNode
  type?: 'body-sm' | 'h6' | 'h3'
  align?: 'start' | 'end'
}

function Detail({ label, children, type = 'body-sm', align = 'start' }: DetailProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', align === 'end' && 'items-end')}>
      <Typography type="body-sm" color="muted" align={align} elementType="dt">
        {label}
      </Typography>
      <Typography
        type={type}
        weight={type === 'body-sm' ? 'medium' : undefined}
        align={align}
        elementType="dd"
        // Only references can be long without a break; amounts and dates set the width of their column.
        className={align === 'end' ? 'tabular-nums' : 'wrap-anywhere'}
      >
        {children}
      </Typography>
    </div>
  )
}
