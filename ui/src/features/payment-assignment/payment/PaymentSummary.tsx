import { FormattedMessage } from 'react-intl'

import type { Payment } from '../../../api/types.ts'
import { SelectionSummary } from '../../../components/SelectionSummary.tsx'
import { useFormatDateTime } from '../../../lib/useFormatDate.ts'
import { useFormatMoney } from '../../../lib/useFormatMoney.ts'

export function PaymentSummary({ payment }: { payment: Payment }) {
  const formatDateTime = useFormatDateTime()
  const formatMoney = useFormatMoney()

  return (
    <SelectionSummary
      title={{ label: <FormattedMessage id="paymentDetails.sender" />, value: payment.senderName }}
      amount={{ label: <FormattedMessage id="paymentDetails.amount" />, value: formatMoney(payment.amount) }}
      reference={{ label: <FormattedMessage id="paymentDetails.reference" />, value: payment.referenceNumber }}
      date={{ label: <FormattedMessage id="paymentDetails.receivedAt" />, value: formatDateTime(payment.receivedAt) }}
      data-testid="payment-details"
    />
  )
}
