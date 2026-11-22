import { cn, Separator } from '@heroui/react'
import type { ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Money } from '../../../api/types.ts'
import { type CompleteSplit, FEE_TYPES } from '../../../domain/split.ts'
import { useFormatCents } from '../../../lib/useFormatMoney.ts'

interface SplitBreakdownProps {
  paymentAmount: Money
  split: CompleteSplit
}

export function SplitBreakdown({ paymentAmount, split }: SplitBreakdownProps) {
  const money = useFormatCents(paymentAmount.currency)

  return (
    <dl className="flex flex-col gap-3" data-testid="split-breakdown">
      <Row label={<FormattedMessage id="paymentDetails.amount" />} data-testid="breakdown-PAYMENT">
        {money(paymentAmount.amountMinor)}
      </Row>
      <Separator />
      {FEE_TYPES.map((type) => (
        <Row
          key={type}
          label={<FormattedMessage id="split.type" values={{ type }} />}
          data-testid={`breakdown-${type}`}
        >
          {/* Zero would otherwise be shown as "-€0.00". */}
          {money(split[type] === 0 ? 0 : -split[type])}
        </Row>
      ))}
      <Separator />
      <Row
        emphasized
        label={<FormattedMessage id="split.type" values={{ type: 'MERCHANT_PAYOUT' }} />}
        data-testid="breakdown-MERCHANT_PAYOUT"
      >
        {money(split.MERCHANT_PAYOUT)}
      </Row>
    </dl>
  )
}

interface RowProps {
  label: ReactNode
  children: ReactNode
  emphasized?: boolean
  'data-testid': string
}

function Row({ label, children, emphasized = false, 'data-testid': testId }: RowProps) {
  return (
    <div className={cn('flex items-baseline gap-4', emphasized && 'font-semibold')} data-testid={testId}>
      <dt className="min-w-0 flex-1">{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  )
}
