import { FormattedMessage } from 'react-intl'

import type { Payment } from '../../../api/types.ts'
import { Detail, DetailList } from '../../../components/Detail.tsx'
import { PaymentStatusChip } from '../../../components/PaymentStatusChip.tsx'
import { Typography } from '../../../components/Typography.tsx'
import { useFormatDateTime } from '../../../lib/useFormatDate.ts'
import { useFormatMoney } from '../../../lib/useFormatMoney.ts'

export function PaymentOverview({ payment }: { payment: Payment }) {
  const formatDateTime = useFormatDateTime()
  const formatMoney = useFormatMoney()
  return (
    <div className="flex flex-col gap-8" data-testid="payment-details">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typography type="body-sm" color="muted">
            <FormattedMessage id="paymentDetails.amount" />
          </Typography>
          <Typography type="h1" className="tabular-nums" elementType="p" data-testid="payment-amount">
            {formatMoney(payment.amount)}
          </Typography>
        </div>
        <PaymentStatusChip status={payment.status} />
      </div>

      <DetailList columns={3}>
        <Detail label={<FormattedMessage id="paymentDetails.sender" />} data-testid="payment-sender">
          {payment.senderName}
        </Detail>
        <Detail label={<FormattedMessage id="paymentDetails.reference" />} data-testid="payment-reference">
          <span className="font-mono break-all">{payment.referenceNumber}</span>
        </Detail>
        <Detail label={<FormattedMessage id="paymentDetails.receivedAt" />} data-testid="payment-received-at">
          {formatDateTime(payment.receivedAt)}
        </Detail>
      </DetailList>
    </div>
  )
}
