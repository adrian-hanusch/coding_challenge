import { ListBox } from '@heroui/react'

import type { Payment } from '../../../../api/types.ts'
import { SearchOption } from '../../../../components/search/SearchOption.tsx'
import { useFormatDateTime } from '../../../../lib/useFormatDate.ts'
import { useFormatMoney } from '../../../../lib/useFormatMoney.ts'

export function PaymentOption({ payment }: { payment: Payment }) {
  const formatMoney = useFormatMoney()
  const formatDateTime = useFormatDateTime()

  return (
    <ListBox.Item id={payment.id} textValue={payment.senderName} data-testid={`payment-option-${payment.id}`}>
      <SearchOption
        title={payment.senderName}
        subtitle={payment.referenceNumber}
        amount={formatMoney(payment.amount)}
        meta={formatDateTime(payment.receivedAt)}
      />
    </ListBox.Item>
  )
}
