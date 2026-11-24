import { FormattedMessage } from 'react-intl'

import { Page } from '../components/Page.tsx'
import { PaymentSelection } from '../features/payment-assignment/PaymentSelection.tsx'

export function SelectPaymentPage() {
  return (
    <Page title={<FormattedMessage id="assign.title" />}>
      <PaymentSelection />
    </Page>
  )
}
