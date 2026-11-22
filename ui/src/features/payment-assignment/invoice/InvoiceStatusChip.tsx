import { Chip } from '@heroui/react'
import { FormattedMessage } from 'react-intl'

import type { InvoiceStatus } from '../../../api/types.ts'

const COLOR = { OPEN: 'accent', PAID: 'success' } as const

export function InvoiceStatusChip({ status }: { status: InvoiceStatus }) {
  return (
    <Chip size="sm" variant="soft" color={COLOR[status]}>
      <FormattedMessage id="invoice.status" values={{ status }} />
    </Chip>
  )
}
