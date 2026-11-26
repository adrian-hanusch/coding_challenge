import { FormattedMessage } from 'react-intl'
import { useLocation, useNavigate } from 'react-router'

import { assignPaymentPath, selectPaymentReason } from '../app/paths.ts'
import { Page } from '../components/Page.tsx'
import { PaymentSelection } from '../features/payment-assignment/PaymentSelection.tsx'

export function SelectPaymentPage() {
  const navigate = useNavigate()
  const reason = selectPaymentReason(useLocation().state)

  return (
    <Page title={<FormattedMessage id="assign.title" />} focusTitle={reason === 'afterAssignment'}>
      <PaymentSelection
        autoFocusSearch={reason === 'changePayment'}
        onSelect={(paymentId) => void navigate(assignPaymentPath(paymentId))}
      />
    </Page>
  )
}
