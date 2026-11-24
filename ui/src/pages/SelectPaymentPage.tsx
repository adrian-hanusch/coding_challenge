import { FormattedMessage } from 'react-intl'
import { useLocation } from 'react-router'

import { AFTER_ASSIGNMENT } from '../app/paths.ts'
import { Page } from '../components/Page.tsx'
import { PaymentSelection } from '../features/payment-assignment/PaymentSelection.tsx'

export function SelectPaymentPage() {
  const location = useLocation()

  return (
    <Page title={<FormattedMessage id="assign.title" />} focusTitle={location.state === AFTER_ASSIGNMENT}>
      <PaymentSelection />
    </Page>
  )
}
