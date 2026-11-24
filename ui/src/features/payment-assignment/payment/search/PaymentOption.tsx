import { ListBox } from '@heroui/react'

import type { Payment } from '../../../../api/types.ts'
import { Typography } from '../../../../components/Typography.tsx'
import { useFormatDateTime } from '../../../../lib/useFormatDate.ts'
import { useFormatMoney } from '../../../../lib/useFormatMoney.ts'

export function PaymentOption({ payment }: { payment: Payment }) {
  const formatMoney = useFormatMoney()
  const formatDateTime = useFormatDateTime()

  return (
    <ListBox.Item id={payment.id} textValue={payment.senderName} data-testid={`payment-option-${payment.id}`}>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{payment.senderName}</span>
          <Typography type="body-xs" color="muted" weight="normal" truncate className="font-mono" elementType="span">
            {payment.referenceNumber}
          </Typography>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="font-medium tabular-nums">{formatMoney(payment.amount)}</span>
          <Typography type="body-xs" color="muted" weight="normal" elementType="span">
            {formatDateTime(payment.receivedAt)}
          </Typography>
        </div>
      </div>
    </ListBox.Item>
  )
}
