import { Chip } from '@heroui/react'
import { FormattedMessage } from 'react-intl'

import type { PaymentStatus } from '../api/types.ts'

const COLOR = { UNMATCHED: 'warning', ASSIGNED: 'success' } as const

export function PaymentStatusChip({ status }: { status: PaymentStatus }) {
  return (
    <Chip variant="soft" color={COLOR[status]}>
      <FormattedMessage id="payment.status" values={{ status }} />
    </Chip>
  )
}
